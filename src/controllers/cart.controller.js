import { Cart } from "../models/cart.model.js";
import { Item } from "../models/Items.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";

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
  if (!user) {
    throw new ApiError(401, "Unauthorize persone");
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
              price: product.priceInfo.finalPrice,
            },
          },
        },
        { new: true }
      );
    }
  } else {
    data = await Cart.create({
      user: user._id,
      items: [{ itemId: id, size, price: product.priceInfo.finalPrice }],
    });
  }
  const items = data.items.map((ele) => ele.itemId);
  res.status(200).json(new ApiResponce(200, items, message));
});

const removeCartData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  console.log("run");
  if (!id) {
    throw new ApiError(400, "Id is necessary");
  }
  if (!user) {
    throw new ApiError(401, "Unauthorize persone");
  }
  console.log("run1");
  const item = await Cart.findOne({
    user: user._id,
    items: { $in: { itemId: id } },
  });
  if (!item) {
    new ApiError(400, "Product is not availbel in cart");
  }
  console.log("run2");
  const data = await Cart.findOneAndUpdate(
    { user: user._id },
    {
      $pull: {
        items: { itemId: id },
      },
    },
    { new: true }
  );
  console.log("run3");
  const items = data.items.map((ele) => ele.itemId);
  console.log(items);
  console.log(items.length);
  res.status(200).json(new ApiResponce(200, items, "done"));
});

const acessDataFromCart = asyncHandler(async (req, res) => {
  const user = req.user;
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
  res.status(200).json(new ApiResponce(200, items, "done"));
});

export { acessCartData, addCartData, removeCartData, acessDataFromCart };
