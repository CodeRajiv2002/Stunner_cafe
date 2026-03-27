import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, default: 4 },
    status: {
      type: String,
      enum: ["Available", "Occupied"],
      //   Reserved
      default: "Available",
    },
    qrCodeUrl: { type: String },
    currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true },
);

const Table = mongoose.model("Table", tableSchema);
export default Table;
