import express from "express";
import { createSOSAlert } from "../Controller/sosController.js";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createSOSAlert);

export default router;
