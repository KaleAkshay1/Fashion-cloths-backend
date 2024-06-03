import mongoose, { Schema, model } from "mongoose";

const itemsSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true, _id: false }
);

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [itemsSchema],
  },
  { timestamps: true }
);

export const Cart = model("Cart", cartSchema);
