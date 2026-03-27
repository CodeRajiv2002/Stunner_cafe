import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true },
    text: { type: String, required: true },
    sender: { type: String, enum: ["user", "staff"], required: true },
    isRead: { type: Boolean, default: false }, // Helps track unread messages
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
