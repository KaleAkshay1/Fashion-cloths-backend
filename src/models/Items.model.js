import { Schema, model } from "mongoose";

const itemsSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  descriptions: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    enum: ["men", "women", "kids", "unisex"],
    type: String,
    trim: true,
    required: true,
  },
  category: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  images: {
    all: {
      type: [String],
      trim: true,
    },
    first: {
      type: String,
      required: true,
      trim: true,
    },
    last: {
      type: String,
      required: true,
      trim: true,
    },
  },
  priceInfo: {
    finalPrice: {
      type: Number,
    },
    initialPrice: {
      type: Number,
      required: true,
    },
    isOnSale: {
      type: Boolean,
    },
    discountLabel: String,
    formatedFinalPrice: {
      type: String,
      required: true,
    },
    formattedInitialPrice: {
      type: String,
      required: true,
    },
  },
  sizes: {
    type: Map,
    of: Number,
  },
  details: {
    type: Map,
    of: String,
  },
});

export const Item = model("Item", itemsSchema);
