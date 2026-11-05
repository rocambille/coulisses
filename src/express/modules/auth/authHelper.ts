/*
  Purpose:
  Issue and check the one-time secrets sent by email, and send those emails.

  Design notes:
  - Each email carries a link and a 6-digit code backed by one record:
    using either one consumes both
  - The link (256 bits) cannot be guessed, the code (6 digits) can: codes get
    an attempt limit per record and a daily failure limit per account, both
    of which disable codes only, so nobody can lock someone else out
  - Codes are stored as an HMAC keyed with APP_SECRET: a plain hash of six
    digits would be reversed in an instant from a database leak

  Related docs:
  - https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
*/

import crypto from "node:crypto";
import nodemailer from "nodemailer";

import { serverEnv } from "../../../env/server";
import authRepository from "./authRepository";

/* ************************************************************************ */
/* Limits                                                                   */
/* ************************************************************************ */

export const CHALLENGE_LIFETIME_MS = 15 * 60 * 1000;

// Per account, within one CHALLENGE_LIFETIME_MS window: stops email flooding
const MAX_CHALLENGES_PER_WINDOW = 5;

// Per code: wrong guesses before the code (not the link) is disabled
const MAX_CODE_ATTEMPTS = 5;

// Per account and per day: caps guesses spread over many new codes
const MAX_DAILY_CODE_FAILURES = 10;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/* ************************************************************************ */
/* Secrets                                                                  */
/* ************************************************************************ */

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const hashCode = (userId: User["id"], code: string) =>
  crypto
    .createHmac("sha256", serverEnv.APP_SECRET)
    .update(`${userId}:${code}`)
    .digest("hex");

export const isCodeFormat = (code: unknown): code is string =>
  typeof code === "string" && /^\d{6}$/.test(code);

/*
  issueChallenge(userId, newEmail):
  - Creates a link token and a code, replacing the pending ones of the same
    purpose (login when newEmail is null, email change otherwise)
  - Returns null when the account asked for too many emails recently
*/
export const issueChallenge = (userId: User["id"], newEmail: string | null) => {
  const windowStart = new Date(Date.now() - CHALLENGE_LIFETIME_MS);

  if (
    authRepository.countIssuedSince(userId, windowStart) >=
    MAX_CHALLENGES_PER_WINDOW
  ) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

  authRepository.insertToken({
    userId,
    tokenHash: hashToken(token),
    codeHash: hashCode(userId, code),
    newEmail,
    expiresAt: new Date(Date.now() + CHALLENGE_LIFETIME_MS),
  });

  return { token, code };
};

/*
  checkCode(userId, code, purpose):
  - Consumes the pending challenge of that purpose when the code matches
  - Returns null on any failure, without telling why
*/
export const checkCode = (
  userId: User["id"],
  code: string,
  purpose: "login" | "email_change",
) => {
  const dayStart = new Date(Date.now() - ONE_DAY_MS);

  if (
    authRepository.countFailedCodeAttemptsSince(userId, dayStart) >=
    MAX_DAILY_CODE_FAILURES
  ) {
    return null;
  }

  return authRepository.consumeCode({
    userId,
    codeHash: hashCode(userId, code),
    purpose,
    maxAttempts: MAX_CODE_ATTEMPTS,
  });
};

/* ************************************************************************ */
/* Emails                                                                   */
/* ************************************************************************ */

const transporter = serverEnv.SMTP_URL
  ? nodemailer.createTransport({
      url: serverEnv.SMTP_URL,
      ...(serverEnv.DKIM_PRIVATE_KEY &&
        serverEnv.DKIM_DOMAIN && {
          dkim: {
            domainName: serverEnv.DKIM_DOMAIN,
            keySelector: serverEnv.DKIM_SELECTOR,
            privateKey: serverEnv.DKIM_PRIVATE_KEY,
          },
        }),
    })
  : null;

type Email = { to: string; subject: string; paragraphs: string[] };

const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const DO_NOT_SHARE =
  "Ne le transmettez à personne : l'équipe de Coulisses ne vous le demandera jamais.";

const NOT_YOU =
  "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.";

const send = async ({ to, subject, paragraphs }: Email) => {
  const text = paragraphs.join("\n\n");

  if (transporter == null) {
    // Development: no SMTP server, print the email instead
    console.info("----------------------------------------------------------");
    console.info(`To: ${to}\nSubject: ${subject}\n\n${text}`);
    console.info("----------------------------------------------------------");
    return;
  }

  await transporter.sendMail({
    from: { name: "Coulisses", address: "hello@codecollectif.fr" },
    to,
    subject,
    text,
    html: paragraphs
      .map(
        (paragraph) =>
          `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`,
      )
      .join(""),
  });
};

const trustedBaseUrl = serverEnv.APP_BASE_URL.replace(/\/+$/, "");

const minutes = CHALLENGE_LIFETIME_MS / 60_000;

export const sendLoginEmail = (
  to: string,
  { token, code }: { token: string; code: string },
  next: string | null,
) => {
  const link = new URL("/verify", trustedBaseUrl);
  link.searchParams.set("token", token);

  if (next != null) {
    link.searchParams.set("next", next);
  }

  return send({
    to,
    subject: "Votre connexion à Coulisses",
    paragraphs: [
      "Bonjour,",
      `Pour vous connecter à Coulisses, ouvrez ce lien :\n${link}`,
      `Ou saisissez ce code dans l'application :\n${code}`,
      `Le lien et le code expirent dans ${minutes} minutes et ne servent qu'une fois. ${DO_NOT_SHARE}`,
      NOT_YOU,
    ],
  });
};

export const sendEmailChangeCode = (to: string, code: string) =>
  send({
    to,
    subject: "Confirmez votre nouvelle adresse sur Coulisses",
    paragraphs: [
      "Bonjour,",
      `Pour utiliser cette adresse avec votre compte Coulisses, saisissez ce code dans l'application :\n${code}`,
      `Le code expire dans ${minutes} minutes et ne sert qu'une fois. ${DO_NOT_SHARE}`,
      NOT_YOU,
    ],
  });

export const sendEmailChangedNotice = (to: string, newEmail: string) =>
  send({
    to,
    subject: "L'adresse de votre compte Coulisses a changé",
    paragraphs: [
      "Bonjour,",
      `L'adresse e-mail de votre compte Coulisses est désormais ${newEmail}. Cette adresse-ci ne permet plus de vous connecter.`,
      "Si vous n'êtes pas à l'origine de ce changement, répondez à ce message.",
    ],
  });
