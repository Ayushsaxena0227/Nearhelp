import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

export const getNearbySkills = async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ error: "Location is required." });

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const radiusKm = parseFloat(radius);
    const snapshot = await admin.firestore().collection("skills").get();

    const nearbySkills = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.location?.latitude) return null;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.location.latitude,
          data.location.longitude
        );
        return { ...data, distance };
      })
      .filter((skill) => skill && skill.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json(nearbySkills);
  } catch (err) {
    console.error("Error fetching nearby skills:", err);
    res.status(500).json({ error: err.message });
  }
};
