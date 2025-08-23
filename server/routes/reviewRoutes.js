import express from "express";
import { createReview } from "../Controller/reviewController.js";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createReview);

export default router;
