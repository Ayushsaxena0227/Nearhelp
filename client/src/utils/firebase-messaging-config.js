// utils/firebase-messaging-config.js
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase";

const messaging = getMessaging(app);

const VAPID_KEY =
  "BPo-i8az_dIJKO6ptQ7kOsyQGW2-ycEY0PVGc4ekpsl7udKj-bqu2raDy3zyDoengVHscKQMgBDw4pMKbiTSIDE";

// Store the current token to avoid unnecessary updates
let currentToken = null;

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
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered successfully:", registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("Service Worker is ready");
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
        currentToken = token;

        // Send token to backend
        const success = await updateUserFCMToken(token);
        if (success) {
          console.log("Notification system initialized successfully");

          // Set up foreground message handling
          handleForegroundMessages();

          // Set up token refresh handling
          setupTokenRefresh();

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

// Handle token refresh
const setupTokenRefresh = () => {
  onTokenRefresh(messaging, async (refreshedToken) => {
    console.log("🔄 Token refreshed:", refreshedToken);

    if (refreshedToken !== currentToken) {
      currentToken = refreshedToken;
      console.log("📱 Updating backend with new token...");

      const success = await updateUserFCMToken(refreshedToken);
      if (success) {
        console.log("✅ Backend updated with refreshed token");
      } else {
        console.error("❌ Failed to update backend with refreshed token");
      }
    }
  });
};

// Handle foreground messages with better debugging
export const handleForegroundMessages = () => {
  console.log("Setting up foreground message handler...");

  onMessage(messaging, (payload) => {
    console.log("🔥 Message received in foreground: ", payload);
    console.log("🔥 Notification permission status:", Notification.permission);

    if (Notification.permission === "granted") {
      console.log("🔥 Creating notification...");

      try {
        const notification = new Notification(
          payload.notification?.title || "New Message",
          {
            body: payload.notification?.body || "You have a new message",
            icon: "/help.png",
            badge: "/help.png",
            tag: "nearhelp-notification",
            requireInteraction: true,
            data: payload.data,
            silent: false,
            vibrate: [200, 100, 200],
          }
        );

        notification.onclick = function () {
          console.log("🔥 Notification clicked");
          window.focus();

          // Handle navigation based on notification data
          if (payload.data?.matchId) {
            const matchUrl = `/chat/${payload.data.matchId}`;
            if (window.location.pathname !== matchUrl) {
              window.location.href = matchUrl;
            }
          }

          notification.close();
        };

        notification.onshow = function () {
          console.log("🔥 Notification shown");
        };

        notification.onerror = function (error) {
          console.error("🔥 Notification error:", error);
        };

        console.log("🔥 Notification created successfully");
      } catch (error) {
        console.error("🔥 Error creating notification:", error);
      }
    } else {
      console.log(
        "🔥 Notification permission not granted, cannot show notification"
      );
    }
  });

  console.log("Foreground message handler set up complete");
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

// Force refresh token (useful when backend reports invalid token)
export const refreshFCMToken = async () => {
  try {
    console.log("🔄 Force refreshing FCM token...");

    // Clear current token
    currentToken = null;

    // Get a new token
    const newToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (newToken) {
      console.log("🔄 New token obtained:", newToken);
      currentToken = newToken;

      const success = await updateUserFCMToken(newToken);
      if (success) {
        console.log("✅ Token refreshed and updated successfully");
        return newToken;
      } else {
        console.error("❌ Failed to update refreshed token");
        return false;
      }
    } else {
      console.error("❌ Could not obtain new token");
      return false;
    }
  } catch (error) {
    console.error("Error refreshing FCM token:", error);
    return false;
  }
};

// Get current token
export const getCurrentToken = () => {
  return currentToken;
};

// Test function to send a test notification
export const testNotification = () => {
  console.log("Testing notification...");

  if (Notification.permission === "granted") {
    const notification = new Notification("Test Notification", {
      body: "This is a test notification to check if notifications are working",
      icon: "/help.png",
      tag: "test-notification",
    });

    notification.onclick = () => {
      console.log("Test notification clicked");
      notification.close();
    };

    return true;
  } else {
    console.log("Notification permission not granted");
    return false;
  }
};

// Debug function to check notification status
export const checkNotificationStatus = () => {
  console.log("=== Notification Debug Info ===");
  console.log("Notification permission:", Notification.permission);
  console.log("Service Worker supported:", "serviceWorker" in navigator);
  console.log("Push messaging supported:", "PushManager" in window);
  console.log("Auth token exists:", !!localStorage.getItem("token"));
  console.log("Current FCM token:", currentToken);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      console.log("Service Worker registrations:", registrations.length);
      registrations.forEach((reg, index) => {
        console.log(`Registration ${index}:`, reg.scope);
      });
    });
  }

  return {
    permission: Notification.permission,
    serviceWorkerSupported: "serviceWorker" in navigator,
    pushSupported: "PushManager" in window,
    hasAuthToken: !!localStorage.getItem("token"),
    currentToken: currentToken,
  };
};

// Export a function to manually trigger notification setup (useful for testing)
export const manuallyInitializeNotifications = async () => {
  console.log("Manually initializing notifications...");
  return await initializeNotifications();
};
