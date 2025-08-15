import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import { createNeed, getNeeds } from "../Controller/needController.js";

const router = express.Router();

router.post("/create", verifyFirebaseToken, createNeed);
router.get("/", getNeeds);

export default router;
