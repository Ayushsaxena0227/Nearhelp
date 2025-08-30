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

    // We will now fetch the user, their reviews, AND their skills
    const userRef = db.collection("users").doc(userId);
    const reviewsRef = db
      .collection("reviews")
      .where("rateeUid", "==", userId)
      .orderBy("createdAt", "desc");
    const skillsRef = db
      .collection("skills")
      .where("ownerUid", "==", userId)
      .orderBy("createdAt", "desc"); // 👈 NEW

    const [userSnap, reviewsSnap, skillsSnap] = await Promise.all([
      // 👈 NEW
      userRef.get(),
      reviewsRef.get(),
      skillsRef.get(), // 👈 NEW
    ]);

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userSnap.data();
    const reviews = reviewsSnap.docs.map((doc) => doc.data());
    const skills = skillsSnap.docs.map((doc) => doc.data()); // 👈 NEW

    const publicProfile = {
      uid: userData.uid,
      name: userData.name,
      ratingAvg: userData.ratingAvg || 0,
      ratingCount: userData.ratingCount || 0,
      reviews,
      skills, // 👈 NEW: Attach the user's skills to the response
    };

    res.status(200).json(publicProfile);
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};
