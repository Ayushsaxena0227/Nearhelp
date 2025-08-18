import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";
import {
  listMatchesForUser,
  getMessages,
  sendMessage,
} from "../Controller/matchesController.js";

const router = express.Router();

// 1) List matches for the logged-in user (seeker or helper)
router.get("/", verifyFirebaseToken, listMatchesForUser);

// 2) Get all messages in one match
router.get("/:matchId/messages", verifyFirebaseToken, getMessages);

// 3) Send a new message in a match
router.post("/:matchId/messages", verifyFirebaseToken, sendMessage);

export default router;
