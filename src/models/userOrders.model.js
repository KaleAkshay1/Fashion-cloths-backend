import mongoose, { Schema, model } from "mongoose";

const bagSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    quentity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const ordersScema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: String,
      required: true,
      trim: true,
    },
    quentity: {
      type: Number,
      required: true,
    },
    delivery: {
      type: String,
      enum: ["pending", "done", "cancell"],
      default: "pending",
    },
    payment: {
      type: String,
      enum: ["done", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const userOrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    whishlist: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    bag: [bagSchema],
    orders: [ordersScema],
  },
  { timestamps: true }
);

export const UserOrders = model("UserOrders", userOrderSchema);
