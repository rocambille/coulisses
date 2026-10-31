/*
  Purpose:
  Validate incoming payloads for push notifications.
*/

import { z } from "zod";

/*
  The server POSTs to whatever endpoint a subscription holds, so accepting any
  URL would let a client aim the server at internal addresses (SSRF).
*/
const PUSH_SERVICE_HOSTS = [
  /^fcm\.googleapis\.com$/,
  /^android\.googleapis\.com$/,
  // Chromium builds without Google API keys
  /^jmt\d+\.google\.com$/,
  /^([a-z0-9-]+\.)*push\.services\.mozilla\.com$/,
  /^([a-z0-9-]+\.)*push\.apple\.com$/,
  /^([a-z0-9-]+\.)*notify\.windows\.com$/,
];

const isPushServiceUrl = (value: string) => {
  if (!URL.canParse(value)) {
    return false;
  }

  const { protocol, port, hostname } = new URL(value);

  return (
    protocol === "https:" &&
    port === "" &&
    PUSH_SERVICE_HOSTS.some((host) => host.test(hostname))
  );
};

export const StoredPushSubscriptionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  endpoint: z.string(),
  p256dh: z.string(),
  auth: z.string(),
  created_at: z.iso.datetime(),
});

export type StoredPushSubscription = z.infer<
  typeof StoredPushSubscriptionSchema
>;

export const SubscribeDTOSchema = z.object({
  endpoint: z.url().refine(isPushServiceUrl, "Unknown push service"),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type SubscribeDTO = z.infer<typeof SubscribeDTOSchema>;

export type SubscribeDTOWithUserId = SubscribeDTO & { user_id: User["id"] };

export const UnsubscribeDTOSchema = z.object({
  endpoint: z.string().min(1),
});

export const NotifyDTOSchema = z.object({
  kind: z.enum(["VOTE_REMINDER", "CASTING_PUBLISHED"]),
});

export type NotificationKind = z.infer<typeof NotifyDTOSchema>["kind"];
