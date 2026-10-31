/*
  Purpose:
  Manage the Web Push subscription of the current browser.

  Design notes:
  - Browser APIs only: call these from effects and event handlers, never
    while rendering, because they do not exist during SSR
  - enablePush must run from a user gesture: browsers refuse the permission
    prompt otherwise

  Related docs:
  - https://developer.mozilla.org/en-US/docs/Web/API/Push_API
*/

import { clientEnv } from "../../env/client";
import { mutate } from "./mutate";

export const isPushConfigured = () => clientEnv.VITE_VAPID_PUBLIC_KEY != null;

export const isPushSupported = () =>
  isPushConfigured() &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// iOS only exposes the Push API to apps added to the Home Screen
export const needsHomeScreenInstall = () =>
  isPushConfigured() &&
  !isPushSupported() &&
  /iPhone|iPad|iPod/.test(navigator.userAgent);

const findSubscription = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  return (await registration?.pushManager.getSubscription()) ?? null;
};

export const isPushEnabled = async () => (await findSubscription()) != null;

/*
  enablePush():
  - Asks for the permission and subscribes this browser
  - Returns false when the permission is not granted
*/
export const enablePush = async () => {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return false;
  }

  await navigator.serviceWorker.register("/sw.js");

  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: clientEnv.VITE_VAPID_PUBLIC_KEY,
  });

  try {
    await mutate("/api/notifications/subscribe", "post", subscription.toJSON());
  } catch (error) {
    // A subscription the server ignores would look enabled but stay silent
    await subscription.unsubscribe();
    throw error;
  }

  return true;
};

export const disablePush = async () => {
  const subscription = await findSubscription();

  if (subscription == null) {
    return;
  }

  await mutate("/api/notifications/unsubscribe", "post", {
    endpoint: subscription.endpoint,
  });

  await subscription.unsubscribe();
};
