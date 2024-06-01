import express from "express";
import { imageFields, uplode } from "../Middelware/multer.midelware.js";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  accessCat,
  addProduct,
  fetchMoreProductData,
  fetchProductCategoryData,
  fetchProductData,
} from "../controllers/product.controller.js";

const route = express.Router();

route.post("/add-product", verifyUser, uplode.fields(imageFields), addProduct);

route.get("/aceess-cat", accessCat);
route.get("/fetch-product-data", fetchProductData);
route.get("/fetch-product-cat-data/:cat", fetchProductCategoryData);
route.get("/fetch-product-cat-data/:cat/:startVal", fetchMoreProductData);

export default route;
