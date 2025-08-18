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
    const uid = req.user.uid;
    const { matchId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    // Verify membership in match
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

    // Create message doc
    const msgId = uuidv4();
    const msgData = {
      msgId,
      senderUid: uid,
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await admin
      .firestore()
      .collection("matches")
      .doc(matchId)
      .collection(MESSAGES_SUBCOL)
      .doc(msgId)
      .set(msgData);

    res.json(msgData);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};
