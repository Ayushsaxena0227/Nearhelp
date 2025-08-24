import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";
import ngeohash from "ngeohash"; // 1. Import ngeohash

export const createNeed = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, category, description, location } = req.body;

    if (!title || !category || !description || !location) {
      return res
        .status(400)
        .json({ error: "All fields, including location, are required" });
    }

    // 👇 THE FIX: Create the geohash with a specific precision (level 7)
    const geohash = ngeohash.encode(location.lat, location.lng, 7);

    // ... The rest of your function is exactly the same ...
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
      location,
      geohash, // This is now the precision 7 geohash
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("needs").doc(needId).set(needData);
    res.status(200).json({ message: "Need created", needId });
  } catch (err) {
    console.error("Error creating need:", err);
    res.status(500).json({ error: err.message });
  }
};
function calculateDistance(loc1, loc2) {
  // ... This function is unchanged ...
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 👇 REVISED FUNCTION
export const getNearbyNeeds = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    console.log("\n--- Starting Nearby Needs Search ---");
    console.log(`📍 User Location: lat=${lat}, lng=${lng}, radius=${radius}km`);

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    const centerHash = ngeohash.encode(latitude, longitude, 7);
    const neighbors = ngeohash.neighbors(centerHash);
    const searchHashes = [centerHash, ...neighbors];

    console.log("🔍 Searching in these geohash areas:", searchHashes);

    const snapshot = await admin
      .firestore()
      .collection("needs")
      .where("geohash", "in", searchHashes)
      .limit(100)
      .get();

    console.log(
      `✅ Firestore found ${snapshot.docs.length} potential documents.`
    );

    const userLocation = { lat: latitude, lng: longitude };
    const nearbyNeeds = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.location) return null;
        const distance = calculateDistance(userLocation, data.location);
        return { ...data, distance };
      })
      .filter((need) => need && need.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    console.log(
      `✅ After distance filtering, returning ${nearbyNeeds.length} documents.`
    );
    console.log("--- Search Complete ---\n");

    res.status(200).json(nearbyNeeds);
  } catch (err) {
    console.error("Error fetching nearby needs:", err);
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

    const needs = snapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : null,
    }));

    res.status(200).json(needs);
  } catch (err) {
    console.error("Error fetching needs:", err);
    res.status(500).json({ error: err.message });
  }
};
