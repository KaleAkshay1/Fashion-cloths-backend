import express from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  accessOrderHistory,
  paymentHandeler,
  paymentValidation,
} from "../controllers/PaymentAndOrder.controller.js";

const router = express.Router();

router.post("/payment", verifyUser, paymentHandeler);
router.post("/validation", verifyUser, paymentValidation);
router.get("/access-order-history", verifyUser, accessOrderHistory);

export default router;
