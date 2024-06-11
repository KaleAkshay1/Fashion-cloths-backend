import Razorpay from "razorpay";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import crypto from "crypto-js";
import User from "../models/user.model.js";
import { Cart } from "../models/cart.model.js";
import { Item } from "../models/Items.model.js";
import { Order } from "../models/order.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const accesData = async (user, start, end) => {
  try {
    const item = await Order.findOne({
      user: user._id,
    }).populate("items.itemId");
    let items;
    let total = 0;
    if (!item) {
      items = [];
    } else {
      const sortedItems = item.items.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      let data = sortedItems.slice(start, end);
      items = data;
      total = item.items.length;
    }
    return { items, total };
  } catch (error) {
    return { items: [], total: 0 };
  }
};

const decressOrderdQuentity = async (items) => {
  await Promise.all(
    items.items.map(async (ele, ind) => {
      const size = `sizes.${ele.size}`;
      let item = await Item.findById(ele.itemId);
      if (item) {
        let currentSizeValue = item.sizes.get(ele.size) || 0;
        item.sizes.set(ele.size, currentSizeValue - ele.quantity);
        if (!item.seledItem) {
          item.seledItem = new Map();
        }
        let currentSeledItemValue = item.seledItem.get(ele.size) || 0;
        item.seledItem.set(ele.size, currentSeledItemValue + ele.quantity);
        await item.save();
        let updatedItem = await Item.findById(ele.itemId);
      }
    })
  );
};

const moveItemsToOrder = async (user) => {
  try {
    const userExist = await User.findById(user._id);
    if (!userExist) {
      throw new ApiError(402, "Invalid User");
    }
    const userCart = await Cart.findOne({ user: userExist._id });
    if (!userCart) {
      throw new ApiError(400, "user cart is empty");
    }
    const items = userCart.items.map((ele, ind) => {
      return {
        itemId: ele.itemId,
        size: ele.size,
        quantity: ele.quantity,
        paymentStatus: "SUCCESS",
        amount: ele.dPrice,
      };
    });
    const orders = await Order.findOne({ user: userExist._id });
    let data;
    let cartData;
    const itemsIdsInCart = await Cart.findOne({ user: userExist._id });

    await decressOrderdQuentity(itemsIdsInCart);

    if (orders) {
      data = await Order.findOneAndUpdate(
        { user: userExist._id },
        {
          $push: {
            items: { $each: items },
          },
        },
        { new: true }
      );
      cartData = await Cart.findOneAndUpdate(
        { user: userExist._id },
        { items: [] },
        { new: true }
      );
    } else {
      data = await Order.create({ user: userExist._id, items: items });

      const cartData = await Cart.findOneAndUpdate(
        { user: userExist._id },
        { items: [] },
        { new: true }
      );
    }
    const orderData = await accesData(user, 0, 10);
    return { orderData: orderData.items, total: orderData.total, cartData };
  } catch (error) {
    console.log(error.message);
  }
};

const paymentHandeler = asyncHandler(async (req, res) => {
  const option = req.body;

  if (!option) {
    throw new ApiError(400, "amount and currency is mandetory");
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

  const user = req.user;

  const hmac = crypto.HmacSHA256(
    `${razorpay_order_id}|${razorpay_payment_id}`,
    process.env.RAZORPAY_SECRET
  );

  const digest = hmac.toString(crypto.enc.Hex);

  if (digest !== razorpay_signature) {
    throw new ApiError(400, "Transaction is not legit!");
  }

  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  if (payment.captured) {
    const data = await moveItemsToOrder(user);
    return res.status(200).json(
      new ApiResponce(200, {
        msg: "Transaction is legit!",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        paymentStatus: payment.captured,
        ...data,
      })
    );
  }

  res.status(200).json(
    new ApiResponce(200, {
      msg: "Transaction is legit!",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: payment.captured,
    })
  );
});

const accessOrderHistory = asyncHandler(async (req, res) => {
  const user = req.user;
  const { start, end } = req.query;
  const data = await accesData(user, start, end);
  res.status(200).json(new ApiResponce(200, data, "done"));
});

export { paymentHandeler, paymentValidation, accessOrderHistory };
