import React from "react";
import { Plus } from "lucide-react";
import { useCart } from "../hook/useCart";

const ItemCart = ({
  item,
  imageUrl,
  itemName = "Item Name",
  price = "00",
  type = "Veg",
}) => {
  const isVeg = type.toLowerCase() === "veg";
  const { dispatch } = useCart();

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl md:rounded-4xl bg-white p-1 md:p-1.5 shadow-md hover:shadow-xl transition-all border border-gray-5">
      {/* Image Container: Reduced height for mobile */}
      <div className="relative h-32 md:h-48 w-full overflow-hidden rounded-xl md:rounded-3xl">
        <img
          src={imageUrl}
          alt={itemName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Veg/Non-Veg Badge: Scaled down for mobile */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-md bg-white/90 shadow-sm">
          <div
            className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ${
              isVeg ? "bg-green-600" : "bg-red-600"
            }`}
          />
        </div>
      </div>

      {/* Content: Reduced margins and text sizes */}
      <div className="mt-2 md:mt-4 px-1 md:px-2 pb-1">
        <div className="flex flex-col">
          <h3 className="text-sm md:text-lg font-bold text-gray-800 line-clamp-1 leading-tight">
            {itemName}
          </h3>
          <p className="mt-0.5 text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wide">
            {type}
          </p>
        </div>

        <div className="mt-2 md:mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] md:text-xs font-bold text-gray-400"></span>
            <span className="text-base md:text-xl font-extrabold text-gray-900 leading-none">
              ₹{price}
            </span>
          </div>

          {/* Add to Cart Button: Smaller for mobile */}
          <button
            onClick={() => {
              dispatch({ type: "ADD_TO_CART", payload: item });
              console.log(`${itemName} added to cart`);
            }}
            className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-xl md:rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-100 transition-all hover:bg-orange-600 active:scale-90"
          >
            <Plus className="h-4 w-4 md:h-6 md:w-6" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCart;
