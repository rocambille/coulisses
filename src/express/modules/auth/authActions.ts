/*
  Purpose:
  Centralize all authentication-related actions and middleware for Magic Link.
*/

import type { CookieOptions, RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import userRepository from "../user/userRepository";

const appSecret = process.env.APP_SECRET;

if (appSecret == null) {
  throw new Error("process.env.APP_SECRET is not defined");
}

class Auth<Payload extends JwtPayload | string = JwtPayload> {
  #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  // Session token sign (long lived)
  signSession(payload: Payload): string {
    return jwt.sign(payload, this.#secret, { expiresIn: "30d" });
  }

  // Magic link token sign (short lived)
  signMagicLink(payload: Payload): string {
    return jwt.sign(payload, this.#secret, { expiresIn: "15m" });
  }

  verify(token: string): Payload {
    return jwt.verify(token, this.#secret) as Payload;
  }
}

const auth = new Auth<JwtPayload & { sub: string }>(appSecret);

declare global {
  namespace Express {
    interface Request {
      me: User;
    }
  }
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const verifyAccessToken: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies["__Host-auth"];

    if (token == null) {
      throw new Error("Access token is missing in cookies");
    }

    const payload = auth.verify(token);

    const me = await userRepository.find(Number(payload.sub));

    if (me == null) {
      throw new Error("User not found");
    }

    req.me = me;

    next();
  } catch {
    res.sendStatus(401);
  }
};

/*
  Send a Magic Link token.
*/
const sendMagicLink: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.sendStatus(400);
    return;
  }

  const token = auth.signMagicLink({ sub: email });

  // In a real app we would send the email here using an SMTP or API service.
  // For the POC, we log it and return it for easy testing.
  const magicLink = `http://localhost:5173/verify?token=${token}`; // Assuming standard Vite port
  console.log(`[MAGIC LINK] User requested login: ${magicLink}`);

  res.status(200).json({
    message: "Magic link sent to your email",
    _testing_link: magicLink, // Included strictly for POC ease
    _testing_token: token,
  });
};

/*
  Verify Magic Link token and issue session token.
*/
const verifyMagicLink: RequestHandler = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.sendStatus(400);
    return;
  }

  try {
    const payload = auth.verify(token);

    // Find user directly, or create if doesn't exist yet (simplified onboarding)
    const user = await userRepository.findOrCreateByEmail(payload.sub);

    const sessionToken = auth.signSession({ sub: user.id.toString() });

    res.cookie("__Host-auth", sessionToken, cookieOptions);

    res.status(201).json(user);
  } catch (_err) {
    res.sendStatus(401);
  }
};

const destroyAccessToken: RequestHandler = (_req, res) => {
  res.clearCookie("__Host-auth", cookieOptions);

  res.sendStatus(204);
};

const findMe: RequestHandler = async (req, res) => {
  res.json(req.me);
};

export default {
  verifyAccessToken,
  sendMagicLink,
  verifyMagicLink,
  destroyAccessToken,
  findMe,
};
