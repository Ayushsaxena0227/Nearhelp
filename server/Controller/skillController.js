import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

// Simplified version without location
export const createSkill = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const userData = userDoc.data() || {};

    const skillId = uuidv4();
    const skillData = {
      skillId,
      ownerUid: uid,
      ownerName: userData.name || "Unknown User",
      ownerInitials: (userData.name || "U").slice(0, 2).toUpperCase(),
      category,
      title,
      description,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("skills").doc(skillId).set(skillData);
    res.status(201).json({ message: "Skill created successfully", skillId });
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getSkills = async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("skills")
      .orderBy("createdAt", "desc")
      .get();
    const skills = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
    }));

    res.status(200).json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ error: err.message });
  }
};
