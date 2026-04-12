import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/mailer.js";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: true,
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Check if already verified user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
      isVerified: true,
    });
    if (existingUser)
      return res.status(400).json({ message: "Username or email already taken" });

    // Delete any unverified user with same email to allow retry
    await User.deleteOne({ email, isVerified: false });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await sendOTPEmail(email, otp);

    res.status(201).json({
      message: "OTP sent to your email!",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp)
      return res.status(400).json({ message: "userId and otp are required" });

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ message: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired! Please signup again" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      interests: user.interests,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      interests: user.interests,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logout = (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isVerified: true });
    if (!user)
      return res.status(400).json({ message: "No account found with this email!" });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email!",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const verifyForgotOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < new Date())
      return res.status(400).json({ message: "OTP expired! Try again" });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};