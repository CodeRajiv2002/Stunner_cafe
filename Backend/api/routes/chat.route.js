import express from "express";
import {
  clearTableChat,
  getActiveChats,
} from "../controllers/chatController.js";

const chatRouter = express.Router();
// Existing route to get chats
chatRouter.get("/active", getActiveChats);

// ✅ NEW: Route to delete chats
chatRouter.delete("/:tableNumber", clearTableChat);

export default chatRouter;
