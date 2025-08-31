import admin from "../services/firebaseAdmin.js";
import { v4 as uuidv4 } from "uuid";

export const createReport = async (req, res) => {
  try {
    const reporterUid = req.user.uid;
    const { targetId, targetType, reason, details } = req.body;
    if (!targetId || !targetType || !reason) {
      return res
        .status(400)
        .json({ error: "Missing required fields for report." });
    }
    const validTypes = ["post", "skill", "user", "message"];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ error: "Invalid report type." });
    }

    const reportId = uuidv4();
    const reportData = {
      reportId,
      reporterUid,
      targetId,
      targetType,
      reason, // e.g., 'Spam', 'Inappropriate Content
      details: details || "",
      status: "pending", //TODO-> review for admin
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection("reports").doc(reportId).set(reportData);

    res.status(201).json({ message: "Report submitted successfully." });
  } catch (err) {
    console.error("createReport error:", err);
    res.status(500).json({ error: err.message });
  }
};
