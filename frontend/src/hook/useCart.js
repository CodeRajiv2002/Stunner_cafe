import { createContext, useContext } from "react"; // Removed useReducer

export const CartContext = createContext();

export const cartReducer = (state, action) => {
  // ... (Your switch logic remains exactly the same)
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.find(
        (item) => item._id === action.payload._id,
      );
      if (existingItem) {
        return state.map((item) =>
          item._id === action.payload._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case "INCREASE_QUANTITY":
      return state.map((item) =>
        item._id === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    case "DECREASE_QUANTITY":
      return state.map((item) => {
        if (item._id === action.payload) {
          if (item.quantity === 1) return item;
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
    case "REMOVE_ITEM":
      return state.filter((item) => item._id !== action.payload);
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
