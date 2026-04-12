import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
  try {
    const { image, caption } = req.body;
    if (!image) return res.status(400).json({ message: "Image is required" });

    const post = await Post.create({
      userId: req.user._id,
      image,
      caption,
    });

    const populated = await post.populate("userId", "username profilePic");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const isLiked = post.likes.map(l => l.toString()).includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(l => l.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment is required" });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = {
      userId: req.user._id,
      username: req.user.username,
      profilePic: req.user.profilePic,
      text,
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};