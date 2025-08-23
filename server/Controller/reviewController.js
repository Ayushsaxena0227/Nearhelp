import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

export const createReview = async (req, res) => {
  try {
    const raterUid = req.user.uid;
    // 👇 1. Get the rater's name from the request body
    const { matchId, rateeUid, rating, comment, raterName } = req.body;

    if (!matchId || !rateeUid || !rating) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const db = admin.firestore();
    const reviewId = uuidv4();
    const reviewRef = db.collection("reviews").doc(reviewId);
    const rateeUserRef = db.collection("users").doc(rateeUid);

    // This entire transaction block is your existing, unchanged code
    await db.runTransaction(async (transaction) => {
      const rateeUserDoc = await transaction.get(rateeUserRef);
      if (!rateeUserDoc.exists) {
        throw new Error("User to be reviewed not found.");
      }
      const userData = rateeUserDoc.data();
      const currentRating = userData.ratingAvg || 0;
      const ratingCount = userData.ratingCount || 0;
      const newRatingCount = ratingCount + 1;
      const newTotalRating = currentRating * ratingCount + rating;
      const newAverage = newTotalRating / newRatingCount;
      transaction.update(rateeUserRef, {
        ratingAvg: newAverage,
        ratingCount: newRatingCount,
      });
      transaction.set(reviewRef, {
        reviewId,
        matchId,
        raterUid,
        rateeUid,
        rating,
        comment: comment || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // This line is also unchanged
    await db.collection("matches").doc(matchId).update({ status: "completed" });

    // 👇 2. NEW: Add the system message to the chat
    const messagesRef = db
      .collection("matches")
      .doc(matchId)
      .collection("messages");
    await messagesRef.add({
      type: "system",
      text: `${raterName || "The user"} marked this request as complete.`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Review created successfully." });
  } catch (err) {
    console.error("createReview error:", err);
    res.status(500).json({ error: err.message });
  }
};
