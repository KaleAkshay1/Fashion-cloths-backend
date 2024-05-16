import express from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  acessUserOrders,
  addProductInWhishlist,
  removeUserOrdersInWhishlist,
} from "../controllers/orders.controller.js";

const route = express.Router();

route.get("/add-whishlist/:id/:color", verifyUser, addProductInWhishlist);

route.get("/access-user-order", verifyUser, acessUserOrders);

route.get(
  "/remove-product-in-wishlist/:id/:color",
  verifyUser,
  removeUserOrdersInWhishlist
);

export default route;
