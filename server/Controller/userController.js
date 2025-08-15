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
