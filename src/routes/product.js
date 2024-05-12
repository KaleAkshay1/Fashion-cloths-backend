import express from "express";
import { imageFields, uplode } from "../Middelware/multer.midelware.js";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  accessCat,
  addProduct,
  fetchProductData,
} from "../controllers/product.controller.js";

const route = express.Router();

route.post("/add-product", verifyUser, uplode.fields(imageFields), addProduct);

route.get("/aceess-cat", verifyUser, accessCat);
route.get("/fetch-product-data", fetchProductData);

export default route;
