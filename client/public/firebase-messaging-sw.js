importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCuaVtSTExoSfPE7V799Fd_KFrm-hSphRA",
  authDomain: "nearhelp-7f7af.firebaseapp.com",
  projectId: "nearhelp-7f7af",
  storageBucket: "nearhelp-7f7af.firebasestorage.app",
  messagingSenderId: "386090347515",
  appId: "1:386090347515:web:e2dbee67bcd9972309b95e",
});

const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/help.png", // or your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
