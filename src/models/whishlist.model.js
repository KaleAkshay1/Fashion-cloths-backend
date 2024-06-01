import mongoose, { Schema, model } from "mongoose";

const whishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  },
  { timestamps: true }
);

export const Whishlist = model("Whishlist", whishlistSchema);
