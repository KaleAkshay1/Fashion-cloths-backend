import User from "../models/user.model.js";
import { Whishlist } from "../models/whishlist.model.js";
import { Cart } from "../models/cart.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Item } from "../models/Items.model.js";

const addItemToWhishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const users = await User.findById(user._id);
  if (!users) {
    throw new ApiError(401, "Invalid User");
  }
  const userExist = await Whishlist.findOne({ user: users._id });
  let data;
  if (userExist) {
    if (userExist.items.some((ele) => ele == id)) {
      data = userExist;
    } else {
      data = await Whishlist.findOneAndUpdate(
        { user: users._id },
        {
          $push: {
            items: id,
          },
        },
        { new: true }
      );
    }
  } else {
    data = await Whishlist.create({ user: users._id, items: [id] });
  }
  res.status(200).json(new ApiResponce(200, data.items, "done"));
});

const acessUserWhishlistData = asyncHandler(async (req, res) => {
  const user = req.user;
  const userExist = await User.findById(user._id);
  if (!userExist) {
    throw new ApiError(401, "Unauthorize persone");
  }
  const data = await Whishlist.findOne({ user: userExist._id });
  // .populate("items")
  // .exec();
  res.status(200).json(new ApiResponce(200, data?.items || [], "done"));
});

const removeFromWhishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const item = await Whishlist.findOne({
    user: user._id,
    items: { $in: [id] },
  });

  if (!item) {
    new ApiError(400, "Product is not availbel in whishlist");
  }

  const data = await Whishlist.findOneAndUpdate(
    {
      _id: item._id,
    },
    {
      $pull: { items: id },
    },
    {
      new: true,
    }
  );

  res.status(200).json(new ApiResponce(200, data.items, "done"));
});

const accessDataFromWhishlist = asyncHandler(async (req, res) => {
  const user = req.user;
  const item = await Whishlist.findOne({
    user: user._id,
  })
    .populate("items")
    .exec();
  let items;
  if (!item) {
    items = [];
  } else {
    items = item.items;
  }
  res.status(200).json(new ApiResponce(200, items, "done"));
});

export {
  addItemToWhishlist,
  acessUserWhishlistData,
  removeFromWhishlist,
  accessDataFromWhishlist,
};
