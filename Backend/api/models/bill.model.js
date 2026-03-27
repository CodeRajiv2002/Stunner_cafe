import mongoose from "mongoose";

const billHistorySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerPhone: { type: String }, // Required for WhatsApp link
    paymentMethod: { type: String, enum: ["Cash", "UPI", "Card"] },
    billUrl: { type: String }, // URL to the PDF/Bill hosted on your server
    finalAmount: { type: Number, required: true },
  },
  { timestamps: true },
);
