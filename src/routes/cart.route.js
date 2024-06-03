import express, { Router } from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  acessCartData,
  acessDataFromCart,
  addCartData,
  decressQuentity,
  incressQuentitiy,
  removeCartData,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/fetch-data-from-cart", verifyUser, acessCartData);
router.get("/add-data-from-cart/:id/:size", verifyUser, addCartData);
router.get("/remove-data-from-cart/:id", verifyUser, removeCartData);
router.get("/acces-data-from-cart", verifyUser, acessDataFromCart);
router.get("/incress-quentity-of-item/:id", verifyUser, incressQuentitiy);
router.get("/decress-quentity-of-item/:id", verifyUser, decressQuentity);

export default router;
