// utils/firebase-messaging-config.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const messaging = getMessaging(app);

const VAPID_KEY =
  "BPo-i8az_dIJKO6ptQ7kOsyQGW2-ycEY0PVGc4ekpsl7udKj-bqu2raDy3zyDoengVHscKQMgBDw4pMKbiTSIDE";

// Initialize notifications
export const initializeNotifications = async () => {
  try {
    // Check authentication first
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      console.log("User not authenticated, skipping notification setup");
      return false;
    }

    // Check if service worker is supported
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/firebase-cloud-messaging-push-scope",
        }
      );
      console.log("Service Worker registered successfully:", registration);
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);

    if (permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log("FCM Token:", token);

        // Send token to backend
        const success = await updateUserFCMToken(token);
        if (success) {
          console.log("Notification system initialized successfully");
          return token;
        } else {
          console.error("Failed to save FCM token to backend");
          return false;
        }
      } else {
        console.log("No registration token available.");
        return false;
      }
    } else {
      console.log("Notification permission denied");
      return false;
    }
  } catch (error) {
    console.error("Error initializing notifications:", error);
    return false;
  }
};

// Handle foreground messages
export const handleForegroundMessages = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received in foreground: ", payload);

    if (Notification.permission === "granted") {
      const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: "/help.png",
        badge: "/help.png",
        tag: "nearhelp-notification",
        requireInteraction: true,
        data: payload.data,
      });

      notification.onclick = function () {
        window.focus();
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        notification.close();
      };
    }
  });
};

// Function to update FCM token in backend with better error handling
const updateUserFCMToken = async (token, retryCount = 0) => {
  try {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      console.log("No auth token found, cannot update FCM token");
      return false;
    }

    console.log("Attempting to update FCM token in backend...");

    const response = await fetch(
      "http://localhost:5007/users/update-fcm-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP ${response.status}: ${errorData.error || "Unknown error"}`
      );
    }

    const result = await response.json();
    console.log("FCM token updated successfully:", result);
    return true;
  } catch (error) {
    console.error("Error updating FCM token:", error);

    // Retry once if it's a network error
    if (
      retryCount === 0 &&
      (error.message.includes("fetch") || error.message.includes("network"))
    ) {
      console.log("Retrying FCM token update...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      return updateUserFCMToken(token, 1);
    }

    return false;
  }
};

// Export a function to manually trigger notification setup (useful for testing)
export const manuallyInitializeNotifications = async () => {
  console.log("Manually initializing notifications...");
  return await initializeNotifications();
};
