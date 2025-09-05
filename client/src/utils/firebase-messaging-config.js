import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { auth, app } from "./firebase";
const VAPID_KEY =
  "BPo-i8az_dIJKO6ptQ7kOsyQGW2-ycEY0PVGc4ekpsl7udKj-bqu2raDy3zyDoengVHscKQMgBDw4pMKbiTSIDE";

export const requestForToken = async () => {
  try {
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
