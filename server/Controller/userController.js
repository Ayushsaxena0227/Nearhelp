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
export const handleSocialLogin = async (req, res) => {
  try {
    const { uid, email, name } = req.user;
    const userRef = admin.firestore().collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      console.log(`Returning user logged in via Google: ${email}`);
      res.status(200).json({ message: "Login successful." });
    } else {
      // If they don't have a profile, create a basic one. This is the "signup" part.
      console.log(`New user signed up via Google: ${email}`);
      const newUserProfile = {
        uid,
        email,
        name: name || "New User",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        ratingAvg: 0,
        ratingCount: 0,
      };
      await userRef.set(newUserProfile);
      res.status(201).json({ message: "User profile created successfully." });
    }
  } catch (err) {
    console.error("Social login error:", err);
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
      .orderBy("createdAt", "desc");

    const [userSnap, reviewsSnap, skillsSnap] = await Promise.all([
      userRef.get(),
      reviewsRef.get(),
      skillsRef.get(),
    ]);

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = userSnap.data();
    const reviews = reviewsSnap.docs.map((doc) => doc.data());
    const skills = skillsSnap.docs.map((doc) => doc.data());

    const publicProfile = {
      uid: userData.uid,
      name: userData.name,
      ratingAvg: userData.ratingAvg || 0,
      ratingCount: userData.ratingCount || 0,
      reviews,
      skills,
    };

    res.status(200).json(publicProfile);
  } catch (err) {
    console.error("getUserProfile error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const saveFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    const uid = req.user.uid;

    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }

    const userRef = admin.firestore().collection("users").doc(uid);
    await userRef.update({
      fcmToken: token, // Save the token
    });

    res.status(200).json({ message: "Token saved successfully." });
  } catch (err) {
    console.error("Error saving FCM token:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const uid = req.user.uid; // from your auth middleware

    if (!fcmToken) {
      return res.status(400).json({ error: "FCM token is required" });
    }

    // Update user document with FCM token
    await admin.firestore().collection("users").doc(uid).update({
      fcmToken: fcmToken,
      fcmTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`FCM token updated for user: ${uid}`);
    res.status(200).json({ message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateLastSeen = async (req, res) => {
  try {
    const uid = req.user.uid; // From your auth middleware

    await admin.firestore().collection("users").doc(uid).set(
      {
        lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({ message: "LastSeen updated successfully" });
  } catch (error) {
    console.error("Error updating lastSeen:", error);
    res.status(500).json({ error: "Failed to update lastSeen" });
  }
};
