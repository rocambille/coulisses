/*
  Purpose:
  Centralize all authentication-related actions and middleware for Magic Link.
*/

import crypto from "node:crypto";
import type { CookieOptions, RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import userRepository from "../user/userRepository";
import authRepository from "./authRepository";

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

  // Find or create user to get an ID
  const user = await userRepository.findOrCreateByEmail(email);

  // Clean up old/expired tokens for this user as per request
  await authRepository.deleteExpiredByUser(user.id);

  // Generate opaque token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  // Store in DB
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await authRepository.insertToken(user.id, tokenHash, expiresAt);

  // In a real app we would send the email here using an SMTP or API service.
  // For the POC, we log it and return it for easy testing.
  const magicLink = `http://localhost:5173/verify?token=${rawToken}`;
  console.log(`[MAGIC LINK] User requested login: ${magicLink}`);

  res.status(201).json({
    message: "Magic link sent to your email",
    _testing_link: magicLink, // Included strictly for POC ease
    _testing_token: rawToken,
  });
};

/*
  Verify Magic Link token and issue session token.
*/
const verifyMagicLink: RequestHandler = async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    res.sendStatus(400);
    return;
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const storedToken = await authRepository.findByHash(tokenHash);

    if (storedToken == null) {
      throw new Error("Invalid token");
    }

    if (storedToken.consumed_at != null) {
      throw new Error("Token already consumed");
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new Error("Token expired");
    }

    // Mark as consumed
    await authRepository.markAsConsumed(storedToken.id);

    const user = await userRepository.find(storedToken.user_id);

    if (user == null) {
      throw new Error("User not found");
    }

    const sessionToken = auth.signSession({ sub: user.id.toString() });

    res.cookie("__Host-auth", sessionToken, cookieOptions);

    res.status(201).json(user);
  } catch {
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
