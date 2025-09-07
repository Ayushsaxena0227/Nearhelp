import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  createNeed,
  getNeeds,
  getNearbyNeeds,
} from "../Controller/needController.js";

const router = express.Router();

// This will now handle POST requests to /needs
router.post("/", verifyFirebaseToken, createNeed);
router.get("/nearby", verifyFirebaseToken, getNearbyNeeds);
// This handles GET requests to /needs
router.get("/", verifyFirebaseToken, getNeeds);

export default router;
