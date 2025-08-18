// server/controllers/applicationController.js

import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper applies to a need
 */
export const applyToNeed = async (req, res) => {
  try {
    const helperUid = req.user.uid;
    const { needId, message } = req.body;

    if (!needId || !message) {
      return res.status(400).json({ error: "needId and message are required" });
    }

    // 1) Load the need
    const needSnap = await admin
      .firestore()
      .collection("needs")
      .doc(needId)
      .get();

    if (!needSnap.exists) {
      return res.status(404).json({ error: "Need not found" });
    }
    const need = needSnap.data();

    if (need.ownerUid === helperUid) {
      return res
        .status(400)
        .json({ error: "You cannot apply to your own post" });
    }

    // 2) Prevent duplicate
    const existing = await admin
      .firestore()
      .collection("applications")
      .where("needId", "==", needId)
      .where("helperUid", "==", helperUid)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ error: "Already applied" });
    }

    // 3) Build application object
    const appId = uuidv4();
    const newApp = {
      appId,
      needId,
      seekerUid: need.ownerUid,
      helperUid,
      message,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),

      // Embed need details for frontend convenience
      needTitle: need.title || "",
      needDescription: need.description || "",
      needOwnerName: need.ownerName || "",
    };

    // 4) Save application
    await admin.firestore().collection("applications").doc(appId).set(newApp);

    // 5) Return created application
    return res.status(200).json(newApp);
  } catch (err) {
    console.error("applyToNeed error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get all applications for a single need
 */
export const getApplicationsForNeed = async (req, res) => {
  try {
    const { needId } = req.params;
    const snapshot = await admin
      .firestore()
      .collection("applications")
      .where("needId", "==", needId)
      .orderBy("createdAt", "desc")
      .get();

    const apps = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const appData = doc.data();

        // Lookup helper’s name
        const helperSnap = await admin
          .firestore()
          .collection("users")
          .doc(appData.helperUid)
          .get();
        const helper = helperSnap.data() || {};
        appData.helperName = helper.name || "Anonymous Helper";

        return appData;
      })
    );

    return res.status(200).json(apps);
  } catch (err) {
    console.error("getApplicationsForNeed:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Get all applications for posts owned by the logged-in user
 */
export const getApplicationsForOwner = async (req, res) => {
  try {
    const seekerUid = req.user.uid;
    const snapshot = await admin
      .firestore()
      .collection("applications")
      .where("seekerUid", "==", seekerUid)
      .orderBy("createdAt", "desc")
      .get();

    const apps = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const appData = doc.data();

        // Lookup need details
        const needSnap = await admin
          .firestore()
          .collection("needs")
          .doc(appData.needId)
          .get();
        const need = needSnap.exists ? needSnap.data() : {};

        appData.needTitle = need.title || "";
        appData.needDescription = need.description || "";
        appData.needOwnerName = need.ownerName || "";

        // Lookup helper’s name
        const helperSnap = await admin
          .firestore()
          .collection("users")
          .doc(appData.helperUid)
          .get();
        const helper = helperSnap.data() || {};
        appData.helperName = helper.name || "Anonymous Helper";

        return appData;
      })
    );

    return res.status(200).json(apps);
  } catch (err) {
    console.error("getApplicationsForOwner error:", err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Update application status (accept/reject) and create a match if accepted
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const seekerUid = req.user.uid;
    const { appId, status } = req.body;

    if (!appId || !status) {
      return res.status(400).json({ error: "appId and status are required" });
    }

    const validStatuses = ["accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appRef = admin.firestore().collection("applications").doc(appId);
    const appSnap = await appRef.get();

    if (!appSnap.exists) {
      return res.status(404).json({ error: "Application not found" });
    }

    const appData = appSnap.data();
    if (appData.seekerUid !== seekerUid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update the status
    await appRef.update({ status });

    // If accepted, create a match document
    let matchId = null;
    if (status === "accepted") {
      matchId = uuidv4();
      await admin.firestore().collection("matches").doc(matchId).set({
        matchId,
        needId: appData.needId,
        seekerUid: appData.seekerUid,
        helperUid: appData.helperUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({ message: `Application ${status}`, matchId });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ error: err.message });
  }
};
