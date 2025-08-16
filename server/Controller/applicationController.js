import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

export const applyToNeed = async (req, res) => {
  try {
    const helperUid = req.user.uid;
    const { needId, message } = req.body;

    if (!needId || !message) {
      return res.status(400).json({ error: "needId and message are required" });
    }

    // Get need to find seekerUid
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

    // Prevent duplicate applications
    const existing = await admin
      .firestore()
      .collection("applications")
      .where("needId", "==", needId)
      .where("helperUid", "==", helperUid)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ error: "Already applied to this post" });
    }

    const appId = uuidv4();
    await admin.firestore().collection("applications").doc(appId).set({
      appId,
      needId,
      seekerUid: need.ownerUid,
      helperUid,
      message,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ message: "Application sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

        // *** LOOK UP HELPER’S NAME ***
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

    res.status(200).json(apps);
  } catch (err) {
    console.error("getApplicationsForNeed:", err);
    res.status(500).json({ error: err.message });
  }
};

// And same in getApplicationsForOwner:
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

    res.status(200).json(apps);
  } catch (err) {
    console.error("getApplicationsForOwner:", err);
    res.status(500).json({ error: err.message });
  }
};

// NEW: Update status (accept/reject)
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

    await appRef.update({ status });

    // If accepted → create a match
    if (status === "accepted") {
      const matchId = uuidv4();
      await admin.firestore().collection("matches").doc(matchId).set({
        matchId,
        needId: appData.needId,
        seekerUid: appData.seekerUid,
        helperUid: appData.helperUid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.status(200).json({ message: `Application ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
