import express from "express";
import {
  getTables,
  createTable,
  updateTableStatus,
  resetTable,
} from "../controllers/tableController.js";
import { getOrderHistory } from "../controllers/order.controller.js";

const tableRouter = express.Router();

// Base route: /api/tables
tableRouter.route("/").get(getTables); // GET /api/tables

// PUT /api/tables/:tableNumber
tableRouter.route("/:tableNumber").put(updateTableStatus);

// DELETE /api/tables/:tableNumber/reset
tableRouter.delete("/:tableNumber/reset", resetTable);

export default tableRouter;
