import crypto from "node:crypto";
import { serverEnv } from "../../../env/server";

export const getTroupeInviteToken = (troupeId: number): string => {
  return crypto
    .createHmac("sha256", serverEnv.APP_SECRET)
    .update(`troupe_invite:${troupeId}`)
    .digest("hex")
    .slice(0, 32);
};

export const verifyTroupeInviteToken = (
  troupeId: number,
  token: unknown,
): boolean => {
  if (typeof token !== "string") {
    return false;
  }

  const expected = getTroupeInviteToken(troupeId);
  if (token.length !== expected.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
};

export const getTroupeInviteUrl = (troupeId: number): string => {
  const token = getTroupeInviteToken(troupeId);
  const baseUrl = serverEnv.APP_BASE_URL.replace(/\/+$/, "");
  return `${baseUrl}/troupes/${troupeId}/join?token=${token}`;
};
