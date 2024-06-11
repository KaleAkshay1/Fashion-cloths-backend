import mongoose, { Schema, model } from "mongoose";

const historySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
});

export const History = model("History", historySchema);
