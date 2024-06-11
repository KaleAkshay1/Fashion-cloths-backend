import asyncHandler from "../utils/asyncHandler.js";
import Product from "../models/product.model.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";
import ApiResponce from "../utils/ApiResponce.js";
import { category, color, size, subCategory } from "../constant.js";

const addProduct = asyncHandler(async (req, res) => {
  const {
    product_varients,
    title,
    price,
    dPrice,
    category,
    kidsGender,
    description,
    subCategory,
    product_detail,
  } = req.body;
  const data = [];
  const p_detail = [];
  product_detail.map(async (ele, ind) => {
    p_detail[ind] = { main: ele.main, sub: ele.sub };
  });
  await Promise.all(
    product_varients.map(async (element, index) => {
      data[index] = {
        sizes: {},
        images: [],
        color: element.color,
      };
      for (let i in element.sizes) {
        data[index].sizes[i] = Number(element.sizes[i]);
      }
      for (let i in req.file) {
        if (i.startsWith(index)) {
          let path = req.files[i][0].path;
          const result = await uplodeOnCloudinary(path, "Product");
          await data[index].images.push(result.url);
        }
      }
    })
  );
  const product = await Product.create({
    title,
    price,
    dPrice,
    category: category[0],
    kidsGender,
    description,
    subCategory,
    owner: req.user._id,
    product_varients: data,
    product_details: p_detail,
  });
  res.status(200).json({ done: "true" });
});

const accessCat = asyncHandler(async (req, res, next) => {
  const minMaxPrice = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$dPrice" },
        maxPrice: { $max: "$dPrice" },
      },
    },
  ]);
  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        { subCategory, category, size, color, minMaxPrice: minMaxPrice[0] },
        "data send succesfully"
      )
    );
});

const fetchProductData = asyncHandler(async (req, res) => {
  const women = await Product.find({ category: "women" })
    .sort({ price: "desc" })
    .limit(8);
  const men = await Product.find({ category: "men" })
    .sort({ price: "desc" })
    .limit(6);
  const kids = await Product.find({ category: "kids" })
    .sort({ price: "desc" })
    .limit(4);
  const data = [...women, ...men, ...kids];
  res.status(200).json(new ApiResponce(200, data, "done"));
});

const fetchProductCategoryData = asyncHandler(async (req, res) => {
  const { cat } = req.params;
  const count = await Product.countDocuments({ category: cat });
  const data = await Product.find({
    category: cat,
  }).limit(8);
  res.status(200).json(new ApiResponce(200, { data, count }, "product found"));
});

const fetchMoreProductData = asyncHandler(async (req, res) => {
  const { cat, startVal } = req.params;
  let data;
  if (Number(startVal)) {
    data = await Product.find({ category: cat })
      .skip(Number(startVal))
      .limit(8);
  } else {
    data = await Product.find({ category: cat }).limit(8);
  }

  res.status(200).json(new ApiResponce(200, data, "data fetchd"));
});

export {
  addProduct,
  accessCat,
  fetchProductData,
  fetchProductCategoryData,
  fetchMoreProductData,
};
