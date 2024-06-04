import express from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  paymentHandeler,
  paymentValidation,
} from "../controllers/PaymentAndOrder.controller.js";

const router = express.Router();

router.post("/payment", verifyUser, paymentHandeler);
router.post("/validation", verifyUser, paymentValidation);

export default router;
