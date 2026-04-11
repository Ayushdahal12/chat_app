import User from "../models/user.model.js";

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    if (!interests || !Array.isArray(interests))
      return res.status(400).json({ message: "Interests must be an array" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("interests");

    const users = await User.find({
      _id: { $ne: req.user._id },
      interests: { $in: currentUser.interests }
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};