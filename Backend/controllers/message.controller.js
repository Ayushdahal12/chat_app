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



export const reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== userId.toString()
    );

    // Add new reaction if emoji provided
    if (emoji) {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Emit reaction to other user via socket
    const { getReceiverSocketId, io } = await import("../socket/socket.js");
    const receiverSocketId = getReceiverSocketId(
      message.senderId.toString() === userId.toString()
        ? message.receiverId.toString()
        : message.senderId.toString()
    );
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json({ reactions: message.reactions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};