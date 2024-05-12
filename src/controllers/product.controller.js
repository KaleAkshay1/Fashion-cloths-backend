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
      for (let i in req.files) {
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
  res
    .status(200)
    .json(
      new ApiResponce(
        200,
        { subCategory, category, size, color },
        "data send succesfully"
      )
    );
});

const fetchProductData = asyncHandler(async (req, res) => {
  const data = await Product.find({});
  data.sort(() => Math.random() - 0.5);
  res.status(200).json(new ApiResponce(200, data, "done"));
});

export { addProduct, accessCat, fetchProductData };
