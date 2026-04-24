import mongoose from "mongoose";
import Post from "../models/post.model.js";
import dotenv from "dotenv";

dotenv.config();

const restorePosts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Restore all posts that are marked as deleted
    const result = await Post.updateMany(
      {},
      { 
        $set: { isDeleted: false },
        $unset: { deletedBy: "" }
      }
    );

    console.log("✅ Posts restored successfully!");
    console.log(`📊 Updated ${result.modifiedCount} posts`);

    // Get total posts count
    const totalPosts = await Post.countDocuments();
    console.log(`📈 Total posts in database: ${totalPosts}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error restoring posts:", err.message);
    process.exit(1);
  }
};

restorePosts();
