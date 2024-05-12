import { Schema, model } from "mongoose";

const product_varientsSchema = new Schema({
  color: { type: String, required: true },
  images: [{ type: String }],
  sizes: { type: Schema.Types.Mixed, required: true },
});

const productDetail = new Schema({
  main: { type: String },
  sub: { type: String },
});

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    dPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["men", "women", "kids"],
    },
    kidsGender: {
      type: String,
      trim: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_details: [productDetail],
    product_varients: [product_varientsSchema],
  },
  { timestamps: true }
);

productSchema.methods.totalRating = function () {
  const totalLength = this.ratings.length;
  let totalRating = 0;
  this.ratings.forEach((element) => {
    totalRating += element.rating;
  });
  return Math.round((totalRating / totalLength) * 10) / 10;
};

const Product = model("Product", productSchema);
export default Product;
