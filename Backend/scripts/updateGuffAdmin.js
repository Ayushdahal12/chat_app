import mongoose from "mongoose";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const updateGuffToAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the Guff user by email
    const user = await User.findOne({ email: "guff73696@gmail.com" });

    if (!user) {
      console.log("❌ User not found!");
      process.exit(1);
    }

    console.log("📧 Found user:", user.username);
    console.log("Current isAdmin status:", user.isAdmin);

    // Update to admin
    user.isAdmin = true;
    await user.save();

    console.log("✅ Updated successfully!");
    console.log("👑 Now Admin:", user.isAdmin);
    console.log("📋 User ID:", user._id);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

updateGuffToAdmin();
