import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Admin credentials
    const adminEmail = "guff73696@gmail.com";
    const adminPassword = "Guff123";
    const adminUsername = "admin_guff";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const adminUser = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      profilePic: "",
      interests: [],
      isVerified: true,
      isAdmin: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("🔐 Password:", adminPassword);
    console.log("👤 Username:", adminUsername);
    console.log("🛡️ Admin ID:", adminUser._id);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
