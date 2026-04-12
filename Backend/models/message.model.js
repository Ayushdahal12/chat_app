import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  image: { type: String },
  type: { type: String, default: "text" },
  callDuration: { type: Number, default: 0 },
  seen: { type: Boolean, default: false }, // ✅ add seen
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);