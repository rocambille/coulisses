/*
  Purpose:
  Service worker: display push notifications and open the page they point to.

  Design notes:
  - Served as is from /sw.js, so that its scope covers the whole application
  - Handles push only: there is no offline cache
*/

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const { title, body, url } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/images/icon-192.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url } = event.notification.data;

  const openPage = async () => {
    const [client] = await self.clients.matchAll({ type: "window" });

    if (client == null) {
      return self.clients.openWindow(url);
    }

    // Started together: a refused focus must not cancel the navigation
    return Promise.all([client.focus(), client.navigate(url)]);
  };

  event.waitUntil(openPage());
});
