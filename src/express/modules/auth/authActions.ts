/*
  Purpose:
  Centralize all authentication-related actions and middleware.

  This file handles:
  - User authentication (link or code sent by email)
  - JWT creation and verification
  - Authentication cookie management

  This file intentionally does NOT:
  - Handle routing concerns (handled by authRoutes)
  - Implement authorization logic (handled elsewhere)

  Security model:
  - Stateless authentication via JWT stored in HttpOnly cookies
  - 8-day idle timeout, 30-day absolute timeout
  - Server-side revocation of every session of a user through a version
*/

import type { CookieOptions, RequestHandler, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { serverEnv } from "../../../env/server";
import notificationRepository from "../notification/notificationRepository";
import userRepository from "../user/userRepository";
import {
  checkCode,
  hashToken,
  isCodeFormat,
  issueChallenge,
  sendLoginEmail,
} from "./authHelper";
import authRepository from "./authRepository";
import { toSafeNextPath } from "./authSchemas";

/*
  Extend Express Request to carry authenticated user data.
  This is populated exclusively by verifyAccessToken.
*/
declare global {
  namespace Express {
    interface Request {
      me: User;
    }
  }
}

/* ************************************************************************ */
/* Security options                                                         */
/* ************************************************************************ */

/*
  Session lifetime:
  - Idle timeout: each authenticated request renews the token and the
    cookie for SESSION_IDLE_TIMEOUT
  - Absolute timeout: whatever the activity, a new login is required
    SESSION_ABSOLUTE_TIMEOUT_SECONDS after the last one (auth_time)
*/
const SESSION_IDLE_TIMEOUT = "8d";
const SESSION_ABSOLUTE_TIMEOUT_SECONDS = 30 * 24 * 60 * 60;

/*
  Cookie configuration for authentication token.

  Notes:
  - HttpOnly: inaccessible to JavaScript
  - SameSite=strict: mitigates CSRF
  - Secure: HTTPS only
*/
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 8 * 24 * 60 * 60 * 1000, // 8 days, as SESSION_IDLE_TIMEOUT
};

/*
  ver: the session_version of the user when the session started. Bumping
  it in the database invalidates every session issued before.
*/
type SessionPayload = JwtPayload & {
  sub: string;
  ver: number;
  auth_time: number;
};

/*
  Minimal JWT wrapper to:
  - Encapsulate signing and verification
  - Pin the algorithm, so a token cannot choose how it is checked
*/
class TokenSigner {
  #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  signSession(payload: Pick<SessionPayload, "sub" | "ver" | "auth_time">) {
    return jwt.sign(payload, this.#secret, {
      algorithm: "HS256",
      expiresIn: SESSION_IDLE_TIMEOUT,
    });
  }

  verify(token: string): Partial<SessionPayload> {
    return jwt.verify(token, this.#secret, {
      algorithms: ["HS256"],
    }) as Partial<SessionPayload>;
  }
}

const tokenSigner = new TokenSigner(serverEnv.APP_SECRET);

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/*
  startSession(res, userId):
  - Sets a fresh session cookie, as after a login
  - Returns the user, or null when the account no longer exists
*/
const startSession = (res: Response, userId: User["id"]) => {
  const session = userRepository.findWithSessionVersion(userId);

  if (session == null) {
    return null;
  }

  res.cookie(
    "__Host-auth",
    tokenSigner.signSession({
      sub: userId.toString(),
      ver: session.sessionVersion,
      auth_time: nowInSeconds(),
    }),
    cookieOptions,
  );

  return session.user;
};

/* ************************************************************************ */
/* Actions                                                                  */
/* ************************************************************************ */

/*
  Send a login email (link and code).

  Body:
  - email
  - next (optional): the page to open once logged in through the link.
    Ignored unless it is a path of this site (see authSchemas)

  Response:
  - 204, including when the account asked for too many emails: the answer
    must not tell whether an account exists
*/
const sendMagicLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.sendStatus(400);
    return;
  }

  // Find or create user ID
  const userId = userRepository.findByEmailOrCreate(email);

  const challenge = issueChallenge(userId, null);

  if (challenge != null) {
    await sendLoginEmail(email, challenge, toSafeNextPath(req.body.next));
  }

  res.sendStatus(204);
};

/* ************************************************************************ */

/*
  Authenticate with the link of a login email.

  Response:
  - 201 with user
  - 401 on error
*/
const verifyMagicLink: RequestHandler = (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== "string") {
    res.sendStatus(400);
    return;
  }

  const userId = authRepository.consume(hashToken(token));
  const user = userId == null ? null : startSession(res, userId);

  if (user == null) {
    res.sendStatus(401);
    return;
  }

  res.status(201).json(user);
};

/* ************************************************************************ */

/*
  Authenticate with the code of a login email.

  Response:
  - 201 with user
  - 400 when the code is not 6 digits
  - 401 on any other error, whether the account exists or not
*/
const verifyCode: RequestHandler = (req, res) => {
  const { email, code } = req.body;

  if (typeof email !== "string" || !isCodeFormat(code)) {
    res.sendStatus(400);
    return;
  }

  const userId = userRepository.findByEmail(email)?.id;
  const isValid = userId != null && checkCode(userId, code, "login") != null;
  const user = isValid ? startSession(res, userId) : null;

  if (user == null) {
    res.sendStatus(401);
    return;
  }

  res.status(201).json(user);
};

/* ************************************************************************ */

/*
  Destroy the authentication cookie of this device.

  Notes:
  - Other devices stay logged in: see destroyAllSessions
*/
const destroyAccessToken: RequestHandler = (_req, res) => {
  res.clearCookie("__Host-auth", cookieOptions);

  res.sendStatus(204);
};

/*
  Log out of every device.

  Notes:
  - Bumps the session version, which every existing token now fails
  - Push subscriptions go too: logged out devices must stop receiving alerts
*/
const destroyAllSessions: RequestHandler = (req, res) => {
  userRepository.bumpSessionVersion(req.me.id);
  notificationRepository.deleteByUser(req.me.id);

  res.clearCookie("__Host-auth", cookieOptions);

  res.sendStatus(204);
};

/* ************************************************************************ */
/* Middleware                                                               */
/* ************************************************************************ */

/*
  Verify the access token from cookies and attach the user to req.me.

  Preconditions:
  - Cookie parser has already run

  Response:
  - 401 if token is missing or invalid
*/
const verifyAccessToken: RequestHandler = (req, res, next) => {
  try {
    const token = req.cookies["__Host-auth"];

    if (token == null) {
      throw new Error("Access token is missing in cookies");
    }

    const payload = tokenSigner.verify(token);

    const session = userRepository.findWithSessionVersion(Number(payload.sub));

    if (session == null) {
      throw new Error("User not found");
    }

    // Also rejects tokens issued before versions existed (no ver claim)
    if (payload.ver !== session.sessionVersion) {
      throw new Error("Session revoked");
    }

    if (
      typeof payload.auth_time !== "number" ||
      nowInSeconds() - payload.auth_time > SESSION_ABSOLUTE_TIMEOUT_SECONDS
    ) {
      throw new Error("Session too old");
    }

    // Refresh cookie (extends the idle timeout, not the absolute one)
    const freshToken = tokenSigner.signSession({
      sub: session.user.id.toString(),
      ver: session.sessionVersion,
      auth_time: payload.auth_time,
    });
    res.cookie("__Host-auth", freshToken, cookieOptions);

    req.me = session.user;

    next();
  } catch {
    res.sendStatus(401);
  }
};

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default {
  sendMagicLink,
  verifyMagicLink,
  verifyCode,
  destroyAccessToken,
  destroyAllSessions,
  verifyAccessToken,
  startSession,
};
