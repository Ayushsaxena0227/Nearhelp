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

    // For each match, fetch the *other* user’s name
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

    // 3. --- NEW: Send Push Notification ---
    const receiverProfileSnap = await db
      .collection("users")
      .doc(receiverUid)
      .get();
    if (receiverProfileSnap.exists) {
      const receiverData = receiverProfileSnap.data();
      // Check if the receiver has a notification token
      if (receiverData.fcmToken) {
        const messagePayload = {
          notification: {
            title: `New Message from ${senderName}`,
            body: text,
          },
          token: receiverData.fcmToken,
        };

        await admin.messaging().send(messagePayload);
        console.log(`Notification sent to user: ${receiverUid}`);
      }
    }
    // --- END of new logic ---

    res.status(201).json(newMessage);
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
