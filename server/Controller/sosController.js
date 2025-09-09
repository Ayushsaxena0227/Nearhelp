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

export const createSOSAlert = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { title, description, latitude, longitude } = req.body;

    if (!title || !description || !latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Title, description, and location are required." });
    }

    const userDoc = await admin.firestore().collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const needId = uuidv4();

    // Save the SOS to the 'needs' collection with a special type
    const sosData = {
      needId,
      ownerUid: uid,
      ownerName: userData.name || "A Neighbor",
      ownerInitials: (userData.name || "U").slice(0, 2).toUpperCase(),
      title,
      description,
      type: "sos", // This identifies it as an SOS alert
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    };
    await admin.firestore().collection("needs").doc(needId).set(sosData);

    // --- Send Notifications to Nearby Users ---
    const usersSnapshot = await admin.firestore().collection("users").get();
    const nearbyUserTokens = [];
    const userLocation = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    };

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      // Find users who are nearby, have a notification token, and are NOT the poster
      if (user.fcmToken && user.uid !== uid && user.location) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          user.location.latitude,
          user.location.longitude
        );
        if (distance <= 2) {
          // 2km radius for SOS alerts
          nearbyUserTokens.push(user.fcmToken);
        }
      }
    });

    if (nearbyUserTokens.length > 0) {
      const message = {
        notification: {
          title: "❗ Urgent SOS Nearby!",
          body: `A neighbor needs help: "${title}"`,
        },
        tokens: nearbyUserTokens,
      };
      await admin.messaging().sendMulticast(message);
      console.log(`SOS notification sent to ${nearbyUserTokens.length} users.`);
    }

    res
      .status(201)
      .json({ message: "SOS alert created and notifications sent." });
  } catch (err) {
    console.error("Error creating SOS alert:", err);
    res.status(500).json({ error: err.message });
  }
};
