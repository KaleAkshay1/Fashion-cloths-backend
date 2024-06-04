import Razorpay from "razorpay";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import crypto from "crypto";

const paymentHandeler = asyncHandler(async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const option = req.body;
  console.log(option);

  if (!option) {
    throw new ApiError(400, "cannot find amount,currency and receipt");
  }

  const order = await razorpay.orders.create(option);

  if (!order) {
    throw new ApiError("Bad Requenst");
  }

  res.status(200).json(new ApiResponce(200, order, "success"));
});

const paymentValidation = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

  const expectedSignature = hmac.digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Transaction is not legit!");
  }

  res.status(200).json(
    new ApiResponce(200, {
      msg: "Transaction is legit!",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })
  );
});

export { paymentHandeler, paymentValidation };
