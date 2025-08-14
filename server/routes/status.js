import express from "express";
import verifyFirebaseToken from "../middlewares/verifyFirebaseToken.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, (req, res) => {
  res.json({ ok: true, uid: req.user.uid, email: req.user.email });
});

export default router;
