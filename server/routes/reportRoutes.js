import express from "express";
import { createReport } from "../Controller/reportController.js";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createReport);

export default router;
