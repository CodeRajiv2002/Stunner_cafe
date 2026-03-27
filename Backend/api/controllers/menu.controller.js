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

export const changeMenuItemAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await Menu.findById(id);

  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  menuItem.availability = !menuItem.availability;
  await menuItem.save(); // ✅ Added 'await' to ensure the change is saved before responding

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        menuItem,
        "Menu item availability updated successfully",
      ),
    );
});
