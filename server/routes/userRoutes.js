import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  createUserProfile,
  getMyProfile,
  getUserProfile,
  handleSocialLogin,
  saveFCMToken,
  updateFCMToken,
  updateLastSeen,
} from "../Controller/userController.js";

const router = express.Router();

router.post("/create", verifyFirebaseToken, createUserProfile);
router.get("/me", verifyFirebaseToken, getMyProfile);
router.get("/:userId", verifyFirebaseToken, getUserProfile);
router.post("/social-login", verifyFirebaseToken, handleSocialLogin);
router.post("/save-fcm-token", verifyFirebaseToken, saveFCMToken);
router.post("/update-fcm-token", verifyFirebaseToken, updateFCMToken);
router.post("/update-last-seen", verifyFirebaseToken, updateLastSeen);

export default router;
