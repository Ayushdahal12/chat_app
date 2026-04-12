import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, required: true },
  caption: { type: String, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
      profilePic: { type: String },
      text: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

export default mongoose.model("Post", postSchema);