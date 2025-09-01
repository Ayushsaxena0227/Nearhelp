import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

// Simplified version without location
export const createNeed = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, category, description, isAnonymous } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    let initials = "";
    if (userData.name) {
      const parts = userData.name.trim().split(" ");
      initials =
        parts.length >= 2
          ? parts[0][0] + parts[parts.length - 1][0]
          : parts[0][0];
    }
    const needId = uuidv4();
    const needData = {
      needId,
      ownerUid: uid,
      ownerName: userData.name || userData.email || "Unknown User",
      ownerInitials: initials.toUpperCase(),
      category,
      title,
      description,
      isAnonymous: !!isAnonymous,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("needs").doc(needId).set(needData);
    res.status(200).json({ message: "Need created", needId });
  } catch (err) {
    console.error("Error creating need:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getNeeds = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("needs")
      .orderBy("createdAt", "desc")
      .get();

    const needs = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.isAnonymous) {
        return {
          ...data,
          ownerUid: "anonymous",
          ownerName: "A Neighbor",
          ownerInitials: "?",
        };
      }
      return {
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });

    res.status(200).json(needs);
  } catch (err) {
    console.error("Error fetching needs:", err);
    res.status(500).json({ error: err.message });
  }
};
