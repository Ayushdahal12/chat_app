import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, type, callDuration, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      image, // ✅ save image
      type: type || "text",
      callDuration: callDuration || 0,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



export const markSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId, seen: false },
      { seen: true }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};