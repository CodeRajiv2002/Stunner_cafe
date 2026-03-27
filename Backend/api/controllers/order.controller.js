import Order from "../models/order.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import Table from "../models/table.model.js";
import Message from "../models/message.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getTodayOrders = asyncHandler(async (req, res) => {
  // 1. Get the "status" from query params (e.g., /orders/today?status=Pending)
  const { status } = req.query;

  // 2. Define the start and end of "Today"
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 3. Build the Query object
  // We use 'createdAt' because it's a native Date object in your Schema
  let query = {
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  };

  // 4. Add status filter if provided (and valid)
  if (
    status &&
    ["Pending", "Accepted", "Served", "Cancelled"].includes(status)
  ) {
    query.status = status;
  }

  // 5. Fetch and sort by newest first
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate("items.menuItemId"); // Optional: if you want full menu details

  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: orders.length,
        data: orders,
      },
      "Today's orders retrieved successfully",
    ),
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 1. Basic input validation
  if (!id) {
    throw new ApiError(400, "Order ID is required");
  }

  if (!status || !["Accepted", "Served", "Cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid or missing status value");
  }

  // 2. ✅ EXISTENCE CHECK: Verify the order exists before updating
  const existingOrder = await Order.findById(id);

  if (!existingOrder) {
    throw new ApiError(
      404,
      `Order with ID ${id} does not exist in the database`,
    );
  }

  // 3. Update the order status
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true }, // Returns the modified document
  );

  // 4. REAL-TIME NOTIFICATION
  const io = req.app.get("io");
  if (io) {
    const roomName = `table_${updatedOrder.tableNumber}`;

    io.to(roomName).emit("order_status_updated", {
      orderId: updatedOrder._id,
      status: updatedOrder.status,
      message: `Your order is now ${updatedOrder.status}!`,
    });

    console.log(`📡 Emitted status '${updatedOrder.status}' to ${roomName}`);
  }

  // 5. Success Response
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrder, "Order status updated successfully"),
    );
});

/**
 * @desc    Get all orders matching a time-range preset (No Pagination)
 * @route   GET /api/orders/history
 * @access  Private/Admin
 * @query   {string} status    - Filter by order status: 'Pending', 'Accepted', 'Served', 'Cancelled'
 * @query   {string} timeRange - Preset range: 'today' (default), 'last7days', 'last30days', 'alltime'
 */
export const getOrderHistory = asyncHandler(async (req, res) => {
  // 1. Destructure query parameters (Removed page and limit)
  let { status, timeRange = "today" } = req.query;

  // --- 2. AUTOMATIC DATE CALCULATION ---
  let start = new Date();
  let end = new Date();

  // Ensure the end boundary covers the entire final day
  end.setHours(23, 59, 59, 999);

  switch (timeRange.toLowerCase()) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "last7days":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "last30days":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "alltime":
      start = new Date(0); // Epoch time (1970)
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }

  // --- 3. BUILD QUERY OBJECT ---
  let query = {
    createdAt: { $gte: start, $lte: end },
  };

  if (status) {
    const validStatuses = ["Pending", "Accepted", "Served", "Cancelled"];
    const matchedStatus = validStatuses.find(
      (s) => s.toLowerCase() === status.toLowerCase(),
    );
    if (matchedStatus) {
      query.status = matchedStatus;
    }
  }

  // --- 4. DATA RETRIEVAL ---
  // Fetching all results without .skip() or .limit()
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate("items.menuItemId");

  // --- 5. RESPONSE ---
  res.status(200).json(
    new ApiResponse(
      200,
      {
        count: orders.length, // Provide total count for convenience
        orders,
        appliedFilter: {
          timeRange,
          calculatedStart: start,
          calculatedEnd: end,
          statusQuery: query.status || "All",
        },
      },
      "Order history retrieved successfully",
    ),
  );
});

// @desc    Update payment status for an order
// @route   PATCH /api/orders/:id/payment
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  if (paymentStatus === undefined || paymentStatus.trim() === "") {
    throw new ApiError(400, "Payment status is required");
  }

  if (!["Unpaid", "Paid"].includes(paymentStatus)) {
    throw new ApiError(
      400,
      "Invalid payment status. Must be 'Unpaid' or 'Paid'",
    );
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true, runValidators: true },
  );

  if (!updatedOrder) {
    throw new ApiError(404, "Order not found");
  }

  const io = req.app.get("io");

  if (io) {
    const roomName = `table_${updatedOrder.tableNumber}`;

    // 2. ✅ AUTOMATIC TABLE RESET LOGIC
    // If the bill is paid, clear the customer session and reset the table
    if (paymentStatus === "Paid") {
      // Broadcast event to clear tableNumber from user's localStorage
      io.to(roomName).emit("clear_table_session", {
        message: "Payment successful. Your session has ended.",
        tableNumber: updatedOrder.tableNumber,
      });

      // Optional: Update Table status in DB to "Available"
      // Ensure you have the Table model imported
      await Table.findOneAndUpdate(
        { tableNumber: updatedOrder.tableNumber },
        { status: "Available" },
      );

      await Message.deleteMany({
        tableNumber: Number(updatedOrder.tableNumber),
      });
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedOrder,
        `Order payment marked as ${paymentStatus}`,
      ),
    );
});
