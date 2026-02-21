import Table from "../models/table.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// @desc    Get all tables with their status
// @route   GET /api/tables
// @access  Private/Admin
export const getTables = asyncHandler(async (req, res) => {
  // Fetch all tables and sort them by table number (1, 2, 3...)
  const tables = await Table.find().sort({ tableNumber: 1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { count: tables.length, tables: tables },
        "Tables fetched successfully",
      ),
    );
});

// @desc    Create a new table (One-time setup)
// @route   POST /api/tables
export const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity } = req.body;

  const tableExists = await Table.findOne({ tableNumber });
  if (tableExists) {
    throw new ApiError(400, "Table already exists");
  }

  const table = await Table.create({
    tableNumber,
    capacity,
    status: "Available",
  });

  res
    .status(201)
    .json(new ApiResponse(201, table, "Table created successfully"));
});

// @desc    Update or Toggle table status
// @route   PUT /api/tables/:tableNumber/status
export const updateTableStatus = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;
  const { status } = req.body; // ✅ Check if a specific status is sent

  if (isNaN(tableNumber) || !tableNumber) {
    throw new ApiError(400, "Invalid table number");
  }

  // 1. Find the table strictly by its Number
  const table = await Table.findOne({ tableNumber });

  // 2. Error handling if table doesn't exist
  if (!table) {
    throw new ApiError(404, "Table not found");
  }

  // 3. LOGIC: If explicit status provided, use it. Otherwise, toggle.
  if (status) {
    table.status = status;
  } else {
    // Default toggle behavior if no body is sent
    table.status = table.status === "Available" ? "Occupied" : "Available";
  }

  // 4. Save changes
  await table.save();

  res
    .status(200)
    .json(new ApiResponse(200, table, `Table is now ${table.status}`));
});

// @desc    Reset a table to Available and clear its chat history
// @route   DELETE /api/tables/:tableNumber/reset
export const resetTable = asyncHandler(async (req, res) => {
  const { tableNumber } = req.params;

  // 1. Update Table Status to Available
  const table = await Table.findOneAndUpdate(
    { tableNumber },
    { status: "Available" },
    { new: true },
  );

  // 2. DELETE ALL MESSAGES for this specific table
  // This cleans the chat history for the next customer
  await Message.deleteMany({ tableNumber });

  // 3. Notify via Socket
  const io = req.app.get("io");
  if (io) {
    const roomName = `table_${tableNumber}`;

    // Clear the customer's localStorage and redirect them
    io.to(roomName).emit("clear_table_session", {
      message: "Session ended. All data cleared.",
      tableNumber,
    });

    // Notify any other admin screens that the chat needs to be cleared
    io.to(roomName).emit("chat_cleared", { tableNumber });
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        `Table ${tableNumber} reset and chat history deleted.`,
      ),
    );
});
