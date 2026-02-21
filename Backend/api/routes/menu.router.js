import express from "express";
import { getAllMenuItems } from "../controllers/menu.controller.js";
const menuRouter = express.Router();

// Get all menu items
menuRouter.get("/allitems", getAllMenuItems);

export default menuRouter;
