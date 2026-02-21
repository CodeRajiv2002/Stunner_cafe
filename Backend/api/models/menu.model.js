import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
    image: { type: String, required: true }, // Stores only "filename.jpg"
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

menuSchema.virtual("imageUrl").get(function () {
  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${baseUrl}/images/${this.image}`;
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
