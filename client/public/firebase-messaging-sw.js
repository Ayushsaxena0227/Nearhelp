// firebase-messaging-sw.js (place this file in your public folder)
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

console.log("Firebase Messaging Service Worker loaded");

firebase.initializeApp({
  apiKey: "AIzaSyCuaVtSTExoSfPE7V799Fd_KFrm-hSphRA",
  authDomain: "nearhelp-7f7af.firebaseapp.com",
  projectId: "nearhelp-7f7af",
  storageBucket: "nearhelp-7f7af.firebasestorage.app",
  messagingSenderId: "386090347515",
  appId: "1:386090347515:web:e2dbee67bcd9972309b95e",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: "/help.png",
    badge: "/help.png",
    tag: "nearhelp-notification",
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "open",
        title: "Open Chat",
        icon: "/help.png",
      },
    ],
    data: {
      url: payload.data?.url || "/",
    },
  };

  console.log("Showing notification:", notificationTitle, notificationOptions);

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    const urlToOpen = event.notification.data?.url || "/";
    console.log("Opening URL:", urlToOpen);

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          console.log("Found clients:", clientList.length);

          // If a window is already open, focus it
          for (const client of clientList) {
            if (
              client.url.includes(urlToOpen.split("/")[1]) &&
              "focus" in client
            ) {
              console.log("Focusing existing client:", client.url);
              return client.focus();
            }
          }

          // If no window is open, open a new one
          if (clients.openWindow) {
            console.log("Opening new window:", urlToOpen);
            return clients.openWindow(urlToOpen);
          }
        })
        .catch((error) => {
          console.error("Error handling notification click:", error);
        })
    );
  }
});

// Add install and activate event listeners for debugging
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  event.waitUntil(clients.claim());
});

// Add error handler
self.addEventListener("error", (error) => {
  console.error("Service Worker error:", error);
});

console.log("Firebase Messaging Service Worker setup complete");
