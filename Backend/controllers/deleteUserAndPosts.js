import User from "../models/user.model.js";
import Post from "../models/post.model.js";

// ...existing imports and controllers...

export const deleteUserAndPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Soft delete: mark all posts as deleted instead of removing them
    await Post.updateMany(
      { userId },
      { 
        isDeleted: true,
        deletedBy: userId
      }
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User and all their posts deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
