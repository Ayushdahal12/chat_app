import express from "express";
import {
  signup,
  login,
  logout,
  verifyOTP,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOTP);
router.post("/reset-password", resetPassword);

export default router;