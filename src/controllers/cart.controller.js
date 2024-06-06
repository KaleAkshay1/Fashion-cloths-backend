import { Cart } from "../models/cart.model.js";
import { Item } from "../models/Items.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import razorpay from "razorpay";
import axios from "axios";

const accesData = async (user) => {
  try {
    const item = await Cart.findOne({
      user: user._id,
    }).populate("items.itemId");
    let items;
    if (!item) {
      items = [];
    } else {
      const itemsId = item.items.map((ele) => ele.itemId);
      items = item.items;
    }
    return items;
  } catch (error) {
    return [];
  }
};

const acessCartData = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorize persone");
  }
  const data = await Cart.findOne({ user: user._id });
  if (!data) {
    return res.status(200).json(new ApiResponce(200, [], "done"));
  }
  const itemsId = data.items.map((ele) => ele.itemId);
  res.status(200).json(new ApiResponce(200, itemsId || [], "done"));
});

const addCartData = asyncHandler(async (req, res) => {
  const { id, size } = req.params;
  let message = "Item added in cart";
  const user = req.user;
  if (!id || !size) {
    throw new ApiError(400, "Id and Size is necessary");
  }
  const product = await Item.findById(id);
  if (!product) {
    throw new ApiError(400, "Invalide product id");
  }
  const userExist = await Cart.findOne({ user: user._id });
  let data;
  if (userExist) {
    const items = userExist.items.map((ele) => ele.itemId);
    if (items.some((ele) => ele == id)) {
      data = userExist;
      message = "Item alredy in wishlist";
    } else {
      data = await Cart.findOneAndUpdate(
        { user: user._id },
        {
          $push: {
            items: {
              itemId: id,
              size,
              price: product.priceInfo.initialPrice,
              dPrice: product.priceInfo.finalPrice,
            },
          },
        },
        { new: true }
      );
    }
  } else {
    data = await Cart.create({
      user: user._id,
      items: [
        {
          itemId: id,
          size,
          price: product.priceInfo.initialPrice,
          dPrice: product.priceInfo.finalPrice,
        },
      ],
    });
  }
  const items = data.items.map((ele) => ele.itemId);
  res.status(200).json(new ApiResponce(200, items, message));
});

const removeCartData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!id) {
    throw new ApiError(400, "Id is necessary");
  }
  if (!user) {
    throw new ApiError(401, "Unauthorize persone");
  }
  const item = await Cart.findOne({
    user: user._id,
    items: { $in: { itemId: id } },
  });
  if (!item) {
    new ApiError(400, "Product is not availbel in cart");
  }
  const data = await Cart.findOneAndUpdate(
    { user: user._id },
    {
      $pull: {
        items: { itemId: id },
      },
    },
    { new: true }
  );
  const items = data.items.map((ele) => ele.itemId);
  res.status(200).json(new ApiResponce(200, items, "done"));
});

const acessDataFromCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const items = await accesData(user);
  res.status(200).json(new ApiResponce(200, items, "done"));
});

const incressQuentitiy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const userExist = await Cart.findOne({ user: user._id });
  if (!userExist) {
    throw new ApiError(400, "user doesnt have any items in bag");
  }
  const data = userExist.items.filter((ele) => ele.itemId == id);
  if (data.length !== 1) {
    throw new ApiError(400, "item not exist in cart");
  }
  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(400, "invalid item id");
  }
  const size = data[0].size;

  if (data[0].quantity < item.sizes.get(size)) {
    data[0].quantity = data[0].quantity + 1;
    data[0].price = Number(data[0].price) + Number(item.priceInfo.initialPrice);
    data[0].dPrice = Number(data[0].dPrice) + Number(item.priceInfo.finalPrice);
    await userExist.save();
  } else {
    throw new ApiError(400, "Item is out of Stock");
  }
  const val = await accesData(user);
  res.status(200).json(new ApiResponce(200, val, "done"));
});

const decressQuentity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const userExist = await Cart.findOne({ user: user._id });
  if (!userExist) {
    throw new ApiError(400, "user doesnt have any items in bag");
  }
  const data = userExist.items.filter((ele) => ele.itemId == id);
  if (data.length !== 1) {
    throw new ApiError(400, "item not exist in cart");
  }
  const item = await Item.findById(id);
  if (!item) {
    throw new ApiError(400, "invalid item id");
  }
  if (data[0].quantity > 1) {
    data[0].price = data[0].price - item.priceInfo.initialPrice;
    data[0].dPrice = data[0].dPrice - item.priceInfo.finalPrice;
    data[0].quantity = data[0].quantity - 1;
    await userExist.save();
  } else {
    throw new ApiError(400, "Quantity cannot be less than 1.");
  }
  const val = await accesData(user);
  res.status(200).json(new ApiResponce(200, val, "done"));
});

export {
  acessCartData,
  addCartData,
  removeCartData,
  acessDataFromCart,
  incressQuentitiy,
  decressQuentity,
};
