import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  text: { 
    type: String 
  },
  image: { 
    type: String 
  },
  // 🛠️ Improved: Enum ensures we only use allowed types
  type: { 
    type: String, 
    enum: ["text", "image", "call_ended", "call_missed"], 
    default: "text" 
  },
  // 🛠️ Note: Stored in seconds (e.g., 125 for 2m 5s)
  callDuration: { 
    type: Number, 
    default: 0 
  },
  seen: { 
    type: Boolean, 
    default: false 
  },
  reactions: [
    {
      userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
      },
      emoji: { 
        type: String,
        required: true
      },
    }
  ],
}, { timestamps: true });

// Add an index to make fetching chat history faster
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;