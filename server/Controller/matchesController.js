import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const MESSAGES_SUBCOL = "messages";

// 1) List matches for user
export const listMatchesForUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    // Query matches where user is seeker OR helper
    const seekerQ = admin
      .firestore()
      .collection("matches")
      .where("seekerUid", "==", uid);
    const helperQ = admin
      .firestore()
      .collection("matches")
      .where("helperUid", "==", uid);

    const [seekerSnap, helperSnap] = await Promise.all([
      seekerQ.get(),
      helperQ.get(),
    ]);

    const allMatches = [...seekerSnap.docs, ...helperSnap.docs].map((doc) =>
      doc.data()
    );

    // For each match, fetch the *other* user's name
    const enriched = await Promise.all(
      allMatches.map(async (match) => {
        const otherUid =
          match.seekerUid === uid ? match.helperUid : match.seekerUid;
        const userSnap = await admin
          .firestore()
          .collection("users")
          .doc(otherUid)
          .get();
        const userData = userSnap.data() || {};
        match.otherName = userData.name || "Anonymous";
        return match;
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error("listMatchesForUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 2) Get all messages in a match
export const getMessages = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { matchId } = req.params;

    // Verify the user is part of this match
    const matchSnap = await admin
      .firestore()
      .collection("matches")
      .doc(matchId)
      .get();
    if (!matchSnap.exists) {
      return res.status(404).json({ error: "Match not found" });
    }
    const match = matchSnap.data();
    if (match.seekerUid !== uid && match.helperUid !== uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const msgsSnap = await admin
      .firestore()
      .collection("matches")
      .doc(matchId)
      .collection(MESSAGES_SUBCOL)
      .orderBy("createdAt", "asc")
      .get();

    const messages = msgsSnap.docs.map((d) => d.data());
    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to handle FCM token validation and cleanup
const sendNotificationSafely = async (
  fcmToken,
  messagePayload,
  receiverUid
) => {
  try {
    await admin.messaging().send(messagePayload);
    console.log(`✅ Notification sent successfully to user: ${receiverUid}`);
    return { success: true };
  } catch (error) {
    console.error(
      `❌ Error sending notification to user ${receiverUid}:`,
      error
    );

    // Handle invalid token errors
    if (
      error.code === "messaging/registration-token-not-registered" ||
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/invalid-argument"
    ) {
      console.log(`🧹 Cleaning up invalid FCM token for user: ${receiverUid}`);

      // Remove the invalid token from user's profile
      try {
        await admin.firestore().collection("users").doc(receiverUid).update({
          fcmToken: admin.firestore.FieldValue.delete(),
        });
        console.log(`✅ Invalid FCM token removed for user: ${receiverUid}`);
      } catch (cleanupError) {
        console.error(
          `❌ Error cleaning up FCM token for user ${receiverUid}:`,
          cleanupError
        );
      }

      return {
        success: false,
        error: "invalid_token",
        message: "FCM token was invalid and has been removed",
      };
    }

    // Handle other types of errors (quota exceeded, etc.)
    return {
      success: false,
      error: "send_failed",
      message: error.message,
    };
  }
};

// 3) Send a new message
export const sendMessage = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { text } = req.body;
    const senderUid = req.user.uid;
    const senderName = req.user.name || "A user"; // Get sender's name from token

    if (!text) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const db = admin.firestore();
    const matchRef = db.collection("matches").doc(matchId);
    const messagesRef = matchRef.collection("messages");

    const matchSnap = await matchRef.get();
    if (!matchSnap.exists) {
      return res.status(404).json({ error: "Match not found." });
    }
    const matchData = matchSnap.data();

    // Verify user is part of this match
    if (
      matchData.seekerUid !== senderUid &&
      matchData.helperUid !== senderUid
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to send messages in this match." });
    }

    // 1. Determine who the receiver is
    const receiverUid =
      senderUid === matchData.seekerUid
        ? matchData.helperUid
        : matchData.seekerUid;

    // 2. Save the new message to Firestore
    const newMessage = {
      text,
      senderUid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await messagesRef.add(newMessage);
    console.log(`💬 Message saved to Firestore for match: ${matchId}`);

    // 3. --- IMPROVED: Send Push Notification with error handling ---
    try {
      const receiverProfileSnap = await db
        .collection("users")
        .doc(receiverUid)
        .get();

      if (receiverProfileSnap.exists) {
        const receiverData = receiverProfileSnap.data();

        // Check if the receiver has a notification token
        if (receiverData.fcmToken) {
          console.log(
            `📱 Attempting to send notification to user: ${receiverUid}`
          );

          const messagePayload = {
            notification: {
              title: `New Message from ${senderName}`,
              body: text.length > 100 ? text.substring(0, 100) + "..." : text,
            },
            data: {
              matchId: matchId,
              senderUid: senderUid,
              senderName: senderName,
              type: "chat_message",
            },
            token: receiverData.fcmToken,
          };

          const notificationResult = await sendNotificationSafely(
            receiverData.fcmToken,
            messagePayload,
            receiverUid
          );

          if (!notificationResult.success) {
            console.log(
              `⚠️ Notification failed: ${notificationResult.message}`
            );
          }
        } else {
          console.log(`📱 No FCM token found for user: ${receiverUid}`);
        }
      } else {
        console.log(`👤 Receiver profile not found: ${receiverUid}`);
      }
    } catch (notificationError) {
      // Don't fail the entire request if notification fails
      console.error("❌ Error in notification process:", notificationError);
    }
    // --- END of improved notification logic ---

    // Return success response (even if notification failed)
    res.status(201).json({
      ...newMessage,
      createdAt: new Date().toISOString(), // Return a serializable timestamp
      success: true,
    });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get details for a single match
export const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.uid;

    const matchSnap = await admin
      .firestore()
      .collection("matches")
      .doc(matchId)
      .get();
    if (!matchSnap.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const matchData = matchSnap.data();

    // Security check: ensure the current user is part of this match
    if (userId !== matchData.seekerUid && userId !== matchData.helperUid) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this match" });
    }

    // Determine the "other user's" UID
    const otherUserUid =
      userId === matchData.seekerUid
        ? matchData.helperUid
        : matchData.seekerUid;

    // Fetch the other user's details and the need's details
    const userSnap = await admin
      .firestore()
      .collection("users")
      .doc(otherUserUid)
      .get();
    const needSnap = await admin
      .firestore()
      .collection("needs")
      .doc(matchData.needId)
      .get();

    const otherUserData = userSnap.data() || {};
    const needData = needSnap.data() || {};

    // Prepare the response
    const responseData = {
      ...matchData,
      otherUserName: otherUserData.name || "User",
      otherUserInitials: (otherUserData.name || "U").slice(0, 2).toUpperCase(),
      needTitle: needData.title || "Help Request",
      otherUserLastSeen: otherUserData.lastSeen || null,
    };

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("getMatchDetails error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
