import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  applyToNeed,
  getApplicationsForNeed,
  getApplicationsForOwner,
  updateApplicationStatus,
  getApplicationsByHelper,
} from "../Controller/applicationController.js";

const router = express.Router();

// Apply to a specific post
router.post("/apply", verifyFirebaseToken, applyToNeed);

router.get("/forOwner/all", verifyFirebaseToken, getApplicationsForOwner);

//  Accept/Reject an application
router.post("/updateStatus", verifyFirebaseToken, updateApplicationStatus);

// ✅ CORRECTED ORDER: Specific route comes first
router.get("/by-helper", verifyFirebaseToken, getApplicationsByHelper);

// ❌ Dynamic route comes AFTER specific routes
router.get("/:needId", verifyFirebaseToken, getApplicationsForNeed);

export default router;
