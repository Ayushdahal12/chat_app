import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: "" },
  interests: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
}, { timestamps: true });

export default mongoose.model("User", userSchema);