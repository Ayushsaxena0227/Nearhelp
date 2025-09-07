import express from "express";
import {
  createSkill,
  getSkills,
  getNearbySkills,
} from "../Controller/skillController.js"; // Changed getNearbySkills to getSkills
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

// This handles POST requests to /skills
router.post("/", verifyFirebaseToken, createSkill);
router.get("/nearby", verifyFirebaseToken, getNearbySkills);
// This handles GET requests to /skills
router.get("/", verifyFirebaseToken, getSkills);

export default router;
