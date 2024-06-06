import mongoose, { Schema, model } from "mongoose";

const itemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      unique: true,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS"],
      default: "PENDING",
    },
    delivery: {
      type: String,
      enum: ["PENDING", "SUCCESS"],
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, _id: false }
);

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [itemSchema],
});

export const Order = model("Order", orderSchema);
