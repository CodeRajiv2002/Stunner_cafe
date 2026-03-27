import express from "express";
import menuRouter from "./menu.router.js";
import orderRouter from "./order.routes.js";
import tableRouter from "./tableRoutes.js";
import chatRouter from "./chat.route.js";
const router = express.Router();

router.use("/menu", menuRouter);
router.use("/orders", orderRouter);
router.use("/tables", tableRouter);
router.use("/chats", chatRouter);

// Example route
router.get("/health", (req, res) => {
  res.json({ status: "API is running" });
});

export default router;
