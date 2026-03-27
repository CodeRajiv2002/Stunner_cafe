import Order from "../api/models/order.model.js";
import Menu from "../api/models/menu.model.js";
import Message from "../api/models/message.model.js";

// ==============================
// 1. ORDER HANDLERS
// ==============================

export const handleNewOrder = async (io, socket, data) => {
  try {
    // Validation: Ignore empty orders
    if (!data.items || data.items.length === 0) return;

    // Step A: Sync with Database
    const itemIds = data.items.map((item) => item._id);
    const dbItems = await Menu.find({ _id: { $in: itemIds } });

    let calculatedTotal = 0;
    const trustedItems = [];

    // Step B: Secure Calculation (Use DB prices)
    for (const orderItem of data.items) {
      const dbItem = dbItems.find(
        (item) => item._id.toString() === orderItem._id,
      );

      if (dbItem) {
        const itemTotal = dbItem.price * orderItem.quantity;
        calculatedTotal += itemTotal;

        trustedItems.push({
          menuItemId: dbItem._id,
          name: dbItem.name,
          quantity: Number(orderItem.quantity),
          price: Number(dbItem.price),
        });
      }
    }

    // Step C: Create Order
    const newOrder = new Order({
      orderTime: data.orderTime,
      deviceId: data.deviceId,
      tableNumber: data.tableNumber,
      items: trustedItems,
      totalAmount: calculatedTotal,
      comment: data.comment || "",
    });

    const savedOrder = await newOrder.save();

    // Step D: Notification
    io.emit("order_received", savedOrder);
    console.log(`✅ Order saved for Table ${data.tableNumber}`);
  } catch (error) {
    console.error("❌ Order Save Error:", error);
  }
};

// ==============================
// 2. CHAT HANDLERS
// ==============================

export const handleJoinRoom = (socket, roomName) => {
  socket.join(roomName);
};

export const handleUserMessage = async (io, socket, data) => {
  try {
    // 1. Save to Database
    const newMessage = await Message.create({
      tableNumber: data.tableNumber,
      text: data.text,
      sender: "user",
      isRead: false,
    });

    const messagePayload = {
      ...newMessage._doc,
      timestamp: new Date().toLocaleTimeString(), // For immediate UI display
    };

    // 2. EVENT A: Notification (Lightweight - For Badge/Toast)
    io.to("staff_room").emit("chat_notification", {
      tableNumber: data.tableNumber,
      message: "New message received",
      type: "info",
    });

    // 3. EVENT B: Data Sync (For AdminChat list)
    io.to("staff_room").emit("new_chat_message", messagePayload);
  } catch (error) {
    console.error("Chat Save Error:", error);
  }
};

export const handleStaffMessage = async (io, socket, data) => {
  try {
    // 1. Save to Database
    const newMessage = await Message.create({
      tableNumber: data.tableNumber,
      text: data.text,
      sender: "staff",
      isRead: true,
    });

    const replyPayload = {
      text: data.text,
      timestamp: new Date().toLocaleTimeString(),
      sender: "staff",
    };

    // 2. Send to Customer Room
    io.to(`table_${data.tableNumber}`).emit("receive_reply", replyPayload);

    // 3. Sync Staff UI (so other admins see the reply)
    io.to("staff_room").emit("new_chat_message", newMessage);
  } catch (error) {
    console.error("Reply Save Error:", error);
  }
};

// Handle bill request from customer
export const handleBillRequest = async (io, socket, data) => {
  try {
    const { deviceId, tableNumber } = data;
    const todayOrderFromThisDevice = await Order.findOne({
      deviceId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (todayOrderFromThisDevice) {
      // Send to kitchen/admin dashboard
      io.emit("bill_request", {
        tableNumber: tableNumber,
        deviceId: deviceId,
        message: `Bill requested for Table ${tableNumber}`,
      });

      // Optional: Tell the customer's phone it was successful
      socket.emit("bill_request_success", {
        message: "Your waiter has been notified!",
      });
    } else {
      // Optional: Tell the customer if no order was found
      socket.emit("bill_request_failed", {
        message: "We couldn't find an active order for this table.",
      });
    }
  } catch (error) {
    console.error("Error processing bill request:", error);
    socket.emit("bill_request_failed", {
      message: "Server error. Please call a waiter.",
    });
  }
};

export const handleDisconnect = (socket) => {
  console.log(`User disconnected: ${socket.id}`);
};
