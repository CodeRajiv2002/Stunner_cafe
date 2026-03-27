import Message from "../models/message.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// @desc    Get all active chat messages grouped by table
// @route   GET /api/messages/active
// @access  Private/Admin
export const getActiveChats = asyncHandler(async (req, res) => {
  // 1. Fetch all messages, sorted by oldest first (conversation flow)
  const messages = await Message.find().sort({ createdAt: 1 });

  // 2. Group messages by tableNumber
  // Result format: { "1": [msg1, msg2], "5": [msg1] }
  const groupedChats = messages.reduce((acc, msg) => {
    const tableNum = msg.tableNumber;

    if (!acc[tableNum]) {
      acc[tableNum] = [];
    }

    acc[tableNum].push(msg);
    return acc;
  }, {});

  res
    .status(200)
    .json(
      new ApiResponse(200, groupedChats, "Active chats fetched successfully"),
    );
});

// @desc    Clear all chat messages for a specific table
// @route   DELETE /api/messages/:tableNumber
// @access  Private/Admin
export const clearTableChat = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  if (!tableNumber) {
    throw new ApiError(400, "Table ID required");
  }

  await Message.deleteMany({ tableNumber: Number(tableNumber) });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        `Chat history cleared for Table ${tableNumber}`,
      ),
    );
});
