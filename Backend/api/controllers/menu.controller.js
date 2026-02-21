import { asyncHandler } from "../../utils/asyncHandler.js";
import Menu from "../models/menu.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";

export const getAllMenuItems = asyncHandler(async (req, res) => {
  const menuItems = await Menu.find();
  if (!menuItems || menuItems.length === 0) {
    throw new ApiError(404, "No menu items found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, menuItems, "Menu items fetched successfully"));
});
