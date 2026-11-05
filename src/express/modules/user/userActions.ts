/*
  Purpose:
  Define HTTP request handlers for User-related operations.

  This file:
  - Translates HTTP requests into repository calls
  - Shapes HTTP responses (status codes and payloads)
  - Assumes all upstream guarantees are already satisfied

  What this file intentionally does NOT do:
  - No authentication (handled by auth middleware)
  - No authorization (handled by route-level checks)
  - No input validation (handled by validators)
  - No database logic (handled by repositories)

  Design notes:
  - Each handler maps closely to a single use case
  - Side effects are explicit and minimal
  - Handlers remain thin to keep behavior easy to audit
*/

import type { RequestHandler } from "express";

import { deleteUploadedFile } from "../../helpers/upload";
import authActions from "../auth/authActions";
import {
  checkCode,
  issueChallenge,
  sendEmailChangeCode,
  sendEmailChangedNotice,
} from "../auth/authHelper";
import notificationRepository from "../notification/notificationRepository";
import userRepository from "./userRepository";

/* ************************************************************************ */
/* Handlers                                                                 */
/* ************************************************************************ */

/*
  Return the currently authenticated user.

  Preconditions:
  - verifyAccessToken has run successfully
*/
const readMe: RequestHandler = (req, res) => {
  res.json(req.me);
};

/* ************************************************************************ */

/*
  Edit the currently authenticated user.

  Preconditions:
  - User is authenticated
  - req.body has been validated and sanitized

  Response:
  - 204 No Content on success
*/
const editMe: RequestHandler = async (req, res) => {
  const { name, email } = req.body;

  userRepository.updateName(req.me.id, name);

  if (email === req.me.email) {
    res.sendStatus(204);
    return;
  }

  // The email is how the account logs in: it changes only once the new
  // address proves it can receive mail (see confirmMeEmail)
  const challenge = issueChallenge(req.me.id, email);

  if (challenge == null) {
    res.sendStatus(429);
    return;
  }

  await sendEmailChangeCode(email, challenge.code);

  res.status(202).json({ pending_email: email });
};

/* ************************************************************************ */

/*
  Confirm a pending email change with the code sent to the new address.

  Response:
  - 200 with the updated user, and a new session cookie: every other
    session is closed, since the way to log in just changed
  - 400 on a wrong or expired code
  - 409 when the new address is now used by another account
*/
const confirmMeEmail: RequestHandler = async (req, res) => {
  const newEmail = checkCode(
    req.me.id,
    req.body.code,
    "email_change",
  )?.newEmail;

  if (newEmail == null) {
    res.sendStatus(400);
    return;
  }

  const owner = userRepository.findByEmail(newEmail);

  if (owner != null && owner.id !== req.me.id) {
    res.sendStatus(409);
    return;
  }

  userRepository.updateEmail(req.me.id, newEmail);
  userRepository.bumpSessionVersion(req.me.id);

  const me = authActions.startSession(res, req.me.id);

  await sendEmailChangedNotice(req.me.email, newEmail);

  res.json(me);
};

/* ************************************************************************ */

/*
  Soft-delete the currently authenticated user.

  Preconditions:
  - User is authenticated

  Response:
  - 204 No Content
*/
const destroyMe: RequestHandler = (req, res) => {
  userRepository.softDelete(req.me.id);
  notificationRepository.deleteByUser(req.me.id);
  deleteUploadedFile(req.me.avatar_url);

  res.sendStatus(204);
};

/* ************************************************************************ */

/*
  Upload avatar image for the currently authenticated user.

  Preconditions:
  - User is authenticated
  - Multer middleware has processed and attached req.file
*/
const uploadMeAvatar: RequestHandler = (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file attached" });
    return;
  }

  const oldAvatarUrl = req.me.avatar_url;
  const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;

  userRepository.updateAvatar(req.me.id, newAvatarUrl);
  deleteUploadedFile(oldAvatarUrl);

  res.status(201).json({ avatar_url: newAvatarUrl });
};

/* ************************************************************************ */

/*
  Delete avatar image for the currently authenticated user.

  Preconditions:
  - User is authenticated
*/
const deleteMeAvatar: RequestHandler = (req, res) => {
  const oldAvatarUrl = req.me.avatar_url;

  userRepository.updateAvatar(req.me.id, null);
  deleteUploadedFile(oldAvatarUrl);

  res.sendStatus(204);
};

/* ************************************************************************ */
/* Export                                                                   */
/* ************************************************************************ */

export default {
  readMe,
  editMe,
  confirmMeEmail,
  destroyMe,
  uploadMeAvatar,
  deleteMeAvatar,
};
