import express from "express";
import {
  getOrderHistory,
  // getOrders,
  getTodayOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controllers/order.controller.js";
const orderRouter = express.Router();

orderRouter.get("/today", getTodayOrders);
orderRouter.put("/update/:id", updateOrderStatus);

// Get /api/orders/history
orderRouter.get("/history", getOrderHistory);

// Route for updating payment
orderRouter.patch("/:id/payment", updatePaymentStatus);

export default orderRouter;
