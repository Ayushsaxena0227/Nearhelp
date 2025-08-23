import admin from "../services/firebaseAdmin.js";
export const createUserProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const email = req.user.email;

    const {
      name = "",
      location = null, // could be {lat, lng} later
      skills = [], // array of skills offered
      badges = [], // trust/reputation badges
    } = req.body;

    const userRef = admin.firestore().collection("users").doc(uid);

    await userRef.set({
      uid,
      email,
      name,
      location,
      skills,
      badges,
      trustScore: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "User profile saved successfully" });
  } catch (err) {
    console.error("Error creating user profile:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userSnap = await admin.firestore().collection("users").doc(uid).get();

    if (!userSnap.exists)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(userSnap.data());
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const reviewsRef = db
      .collection("reviews")
      .where("rateeUid", "==", userId)
      .orderBy("createdAt", "desc");

    // Fetch user data and reviews concurrently
    const [userSnap, reviewsSnap] = await Promise.all([
      userRef.get(),
      reviewsRef.get(),
    ]);

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userSnap.data();
    const reviews = reviewsSnap.docs.map((doc) => doc.data());

    // Prepare a public-safe user profile
    const publicProfile = {
      uid: userData.uid,
      name: userData.name,
      ratingAvg: userData.ratingAvg || 0,
      ratingCount: userData.ratingCount || 0,
      reviews, // Attach the fetched reviews
    };

    res.status(200).json(publicProfile);
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};
