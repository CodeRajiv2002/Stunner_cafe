import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderTime: { type: String, required: true },
    deviceId: { type: String, required: true },
    tableNumber: {
      type: String,
      required: true,
    },
    items: {
      type: [
        {
          menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu" },
          name: String,
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 },
        },
      ],
      // ✅ CUSTOM VALIDATION: Ensures the array is not empty
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "An order must have at least one item.",
      },
      required: true,
    },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Served", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
