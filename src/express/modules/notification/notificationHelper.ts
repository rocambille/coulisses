/*
  Purpose:
  Write and send the Web Push notifications of the application.

  Design notes:
  - Delivery runs in the background: a push service being slow or down must
    never fail, or even delay, the request that triggered it
  - Without VAPID keys push is disabled and every send is a no-op
  - Each send returns the number of people it targets, for admin feedback

  Related docs:
  - https://github.com/web-push-libs/web-push
*/

import webpush from "web-push";
import { serverEnv } from "../../../env/server";
import playRepository from "../play/playRepository";
import preferenceRepository from "../preference/preferenceRepository";
import troupeRepository from "../troupe/troupeRepository";
import notificationRepository from "./notificationRepository";
import type { StoredPushSubscription } from "./notificationSchemas";

type Message = { title: string; body: string; url: string };

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

const { VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = serverEnv;

const vapidDetails =
  VITE_VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT
    ? {
        subject: VAPID_SUBJECT,
        publicKey: VITE_VAPID_PUBLIC_KEY,
        privateKey: VAPID_PRIVATE_KEY,
      }
    : null;

const push = async (
  { endpoint, p256dh, auth }: StoredPushSubscription,
  payload: string,
) => {
  try {
    await webpush.sendNotification(
      { endpoint, keys: { p256dh, auth } },
      payload,
      {
        vapidDetails: vapidDetails ?? undefined,
        TTL: ONE_DAY_IN_SECONDS,
      },
    );
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;

    // 404 and 410 mean the browser dropped this subscription for good
    if (statusCode === 404 || statusCode === 410) {
      notificationRepository.deleteByEndpoint(endpoint);
    } else {
      console.error(`Push delivery failed with status ${statusCode}`);
    }
  }
};

const deliver = (
  findSubscriptions: () => StoredPushSubscription[],
  message: Message,
) => {
  if (vapidDetails == null) {
    return 0;
  }

  try {
    const subscriptions = findSubscriptions();
    const payload = JSON.stringify(message);

    void Promise.all(
      subscriptions.map((subscription) => push(subscription, payload)),
    );

    return new Set(subscriptions.map(({ user_id }) => user_id)).size;
  } catch (error) {
    console.error("Push delivery failed", error);
    return 0;
  }
};

const troupeName = (troupeId: Troupe["id"]) =>
  troupeRepository.find(troupeId)?.name ?? "Coulisses";

const sendToTroupe = (
  troupeId: Troupe["id"],
  message: Omit<Message, "title">,
  exceptUserId: User["id"],
) =>
  deliver(() => notificationRepository.findByTroupe(troupeId, exceptUserId), {
    title: troupeName(troupeId),
    ...message,
  });

// Admins vote too, but only the votes of actors are worth reporting to them
const sendToAdminsAboutActor = (
  troupeId: Troupe["id"],
  actorId: User["id"],
  message: Omit<Message, "title">,
) =>
  deliver(
    () =>
      troupeRepository.findMemberRole(troupeId, actorId) === "ACTOR"
        ? notificationRepository.findAdmins(troupeId)
        : [],
    { title: troupeName(troupeId), ...message },
  );

const LEVEL_LABELS: Record<PlayPreference["level"], string> = {
  HIGH: "🔥 Très envie",
  MEDIUM: "👍 Pourquoi pas",
  LOW: "🤏 Pas trop",
  NOT_INTERESTED: "❌ Pas du tout",
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: serverEnv.VITE_TIMEZONE,
  }).format(new Date(date));

const playUrl = (play: Play, page: "scenes" | "casting" | "documents") =>
  `/troupes/${play.troupe_id}/plays/${play.id}/${page}`;

const playAdded = (play: Play, hasDocument: boolean, authorId: User["id"]) =>
  sendToTroupe(
    play.troupe_id,
    {
      body: `Nouvelle pièce proposée : ${play.title}${hasDocument ? " (texte joint)" : ""}`,
      url: playUrl(play, "scenes"),
    },
    authorId,
  );

const documentsAdded = (play: Play, authorId: User["id"]) =>
  sendToTroupe(
    play.troupe_id,
    {
      body: `Nouveau document pour ${play.title}`,
      url: playUrl(play, "documents"),
    },
    authorId,
  );

type EventSummary = Pick<EventData, "troupe_id" | "title" | "start_time">;

const eventAdded = (event: EventSummary, authorId: User["id"]) =>
  sendToTroupe(
    event.troupe_id,
    {
      body: `Nouvel événement : ${event.title}, le ${formatDate(event.start_time)}`,
      url: `/troupes/${event.troupe_id}/calendar`,
    },
    authorId,
  );

const eventRescheduled = (event: EventSummary, authorId: User["id"]) =>
  sendToTroupe(
    event.troupe_id,
    {
      body: `Horaire modifié : ${event.title}, le ${formatDate(event.start_time)}`,
      url: `/troupes/${event.troupe_id}/calendar`,
    },
    authorId,
  );

const playVoted = (play: Play, voter: User, level: PlayPreference["level"]) =>
  sendToAdminsAboutActor(play.troupe_id, voter.id, {
    body: `${voter.name} : ${LEVEL_LABELS[level]} pour ${play.title}`,
    url: `/troupes/${play.troupe_id}`,
  });

// Sent on the first vote only: it says that someone started, not that they
// finished. The voting status modal tells how far they went.
const votingStarted = (playId: Play["id"], voter: User) => {
  const play = playRepository.find(playId);

  if (play == null) {
    return 0;
  }

  return sendToAdminsAboutActor(play.troupe_id, voter.id, {
    body: `${voter.name} a commencé à voter sur ${play.title}`,
    url: playUrl(play, "scenes"),
  });
};

const voteReminder = (play: Play) =>
  deliver(
    () =>
      notificationRepository.findByUsers(
        preferenceRepository.findIncompleteVoterIds(play.id),
      ),
    {
      title: troupeName(play.troupe_id),
      body: `Pensez à voter sur les scènes de ${play.title}`,
      url: playUrl(play, "scenes"),
    },
  );

const castingPublished = (play: Play, authorId: User["id"]) =>
  sendToTroupe(
    play.troupe_id,
    {
      body: `La distribution de ${play.title} a été mise à jour`,
      url: playUrl(play, "casting"),
    },
    authorId,
  );

export default {
  playAdded,
  documentsAdded,
  eventAdded,
  eventRescheduled,
  playVoted,
  votingStarted,
  voteReminder,
  castingPublished,
};
