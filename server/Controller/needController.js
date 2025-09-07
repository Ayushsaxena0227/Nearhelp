import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
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

export const createNeed = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, category, description, latitude, longitude, locationName } =
      req.body;
    if (!title || !category || !description)
      return res.status(400).json({ error: "All fields are required" });

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const needId = uuidv4();
    const needData = {
      needId,
      ownerUid: uid,
      ownerName: userData.name || "Unknown",
      ownerInitials: (userData.name || "U").slice(0, 2).toUpperCase(),
      category,
      title,
      description,
      isAnonymous: !!req.body.isAnonymous,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      location:
        latitude && longitude
          ? {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              locationName: locationName || "",
            }
          : null,
    };
    await admin.firestore().collection("needs").doc(needId).set(needData);
    res.status(200).json({ message: "Need created", needId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// This function now handles both location-based and general queries
export const getNeeds = async (req, res) => {
  try {
    const { userLat, userLon, radius = 25 } = req.query;
    const snapshot = await admin
      .firestore()
      .collection("needs")
      .orderBy("createdAt", "desc")
      .get();

    let needs = snapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.isAnonymous && data.ownerUid !== req.user.uid) {
        // Show own anonymous posts
        return {
          ...data,
          ownerUid: "anonymous",
          ownerName: "A Neighbor",
          ownerInitials: "?",
        };
      }
      return data;
    });

    if (userLat && userLon) {
      const userLatitude = parseFloat(userLat);
      const userLongitude = parseFloat(userLon);
      needs = needs
        .map((need) => {
          if (!need.location?.latitude) return { ...need, distance: Infinity }; // Put posts without location at the end
          const distance = calculateDistance(
            userLatitude,
            userLongitude,
            need.location.latitude,
            need.location.longitude
          );
          return { ...need, distance };
        })
        .filter((need) => need.distance <= parseFloat(radius))
        .sort((a, b) => a.distance - b.distance);
    }
    res.status(200).json(needs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getNearbyNeeds = async (req, res) => {
  try {
    const { lat, lng, radius = 25 } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ error: "Location is required." });

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const radiusKm = parseFloat(radius);

    const snapshot = await admin.firestore().collection("needs").get();

    const nearbyNeeds = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (!data.location) return null;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.location.latitude,
          data.location.longitude
        );
        return { ...data, distance };
      })
      .filter((need) => need && need.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json(nearbyNeeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
