import React from "react";
import { useCart } from "../hook/useCart";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { toast } from "sonner";
import { getDeviceId } from "../utils/deviceId";

const Cart = () => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // --- PLACE ORDER LOGIC ---
  const handlePlaceOrder = () => {
    const deviceId = getDeviceId();
    if (cart.length === 0) return;

    // 1. Retrieve the table number from LocalStorage
    const storedTable = localStorage.getItem("stunner_table_number");

    // 2. Validation: If no table number, stop the order and alert user
    if (!storedTable) {
      alert(
        "⚠️ Table number not found. Please scan the QR code on your table again to place an order.",
      );
      navigate("/");
      return;
    }

    // --- ✅ NEW: CONFIRMATION DIALOG ---
    const isConfirmed = window.confirm(
      `Ready to place order for ₹${totalPrice}?`,
    );

    // If user clicks "Cancel", stop here
    if (!isConfirmed) return;
    // ----------------------------------

    const orderData = {
      tableNumber: storedTable,
      items: cart,
      deviceId: deviceId,
      totalAmount: totalPrice,
      orderTime: new Date(),
    };

    // Emit the order to the server
    socket.emit("new_order", orderData);

    // Feedback to user
    toast.success(`Order sent to kitchen for Table ${storedTable}! 🚀`);

    // Clear the cart and redirect
    dispatch({ type: "CLEAR_CART" });
    navigate("/");
  };

  if (cart.length === 0) {
    return (
      <div className="p-6 text-center flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold">Your cart is empty 🛒</h2>

        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-orange-500 px-6 py-3 text-white font-semibold hover:bg-orange-600 transition"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {/* Cart Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item._id} // ✅ Changed from item.name to item._id for better React performance
            className="flex items-center gap-4 justify-between rounded-xl border p-4 shadow-sm"
          >
            {/* Left: Image + Info */}
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-16 w-16 rounded-lg object-cover border"
              />

              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  dispatch({
                    type: "DECREASE_QUANTITY",
                    payload: item._id,
                  })
                }
                className="h-8 w-8 rounded-full bg-gray-200 text-lg font-bold"
              >
                −
              </button>

              <span className="min-w-6 text-center font-semibold">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  dispatch({
                    type: "INCREASE_QUANTITY",
                    payload: item._id,
                  })
                }
                className="h-8 w-8 rounded-full bg-gray-200 text-lg font-bold"
              >
                +
              </button>
            </div>

            {/* Delete Button */}
            <button
              onClick={() =>
                dispatch({
                  type: "REMOVE_ITEM",
                  payload: item._id,
                })
              }
              className="text-red-500 font-semibold"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{totalPrice}</span>
        </div>

        <button
          className="mt-4 w-full rounded-xl bg-orange-500 py-3 text-white font-bold hover:bg-orange-600 transition"
          onClick={handlePlaceOrder}
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;
