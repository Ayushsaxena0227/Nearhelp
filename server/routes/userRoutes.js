import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  createUserProfile,
  getMyProfile,
  getUserProfile,
} from "../Controller/userController.js";

const router = express.Router();

router.post("/create", verifyFirebaseToken, createUserProfile);
router.get("/me", verifyFirebaseToken, getMyProfile);
router.get("/:userId", verifyFirebaseToken, getUserProfile);

export default router;
