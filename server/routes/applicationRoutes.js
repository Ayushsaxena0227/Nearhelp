import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  applyToNeed,
  getApplicationsForNeed,
  getApplicationsForOwner,
  updateApplicationStatus,
} from "../Controller/applicationController.js";

const router = express.Router();

// Apply to a specific post
router.post("/apply", verifyFirebaseToken, applyToNeed);

router.get("/forOwner/all", verifyFirebaseToken, getApplicationsForOwner);

router.get("/:needId", verifyFirebaseToken, getApplicationsForNeed);

//  Accept/Reject an application
router.post("/updateStatus", verifyFirebaseToken, updateApplicationStatus);

export default router;
