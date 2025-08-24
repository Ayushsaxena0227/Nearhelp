import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  createNeed,
  getNeeds,
  getNearbyNeeds,
} from "../Controller/needController.js";

const router = express.Router();
router.get("/nearby", verifyFirebaseToken, getNearbyNeeds);
router.post("/create", verifyFirebaseToken, createNeed);
router.get("/", getNeeds);

export default router;
