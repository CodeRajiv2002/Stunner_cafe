import express from "express";
import {
  changeMenuItemAvailability,
  getAllMenuItems,
} from "../controllers/menu.controller.js";
const menuRouter = express.Router();

// Get all menu items
menuRouter.get("/allitems", getAllMenuItems);
menuRouter.patch("/toggle-availability/:id", changeMenuItemAvailability);

export default menuRouter;
