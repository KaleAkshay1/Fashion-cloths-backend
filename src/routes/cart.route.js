import express, { Router } from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  acessCartData,
  acessDataFromCart,
  addCartData,
  removeCartData,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/fetch-data-from-cart", verifyUser, acessCartData);
router.get("/add-data-from-cart/:id/:size", verifyUser, addCartData);
router.get("/remove-data-from-cart/:id", verifyUser, removeCartData);
router.get("/acces-data-from-cart", verifyUser, acessDataFromCart);

export default router;
