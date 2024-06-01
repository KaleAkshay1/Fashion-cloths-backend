import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import { UserOrders } from "../models/userOrders.model.js";
import ApiResponce from "../utils/ApiResponce.js";

const addProductInWhishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const data = await User.findById(user._id);
  if (!data) {
    throw new ApiError(401, "Invalid User");
  }
  const orders = await UserOrders.findOne({ user: user._id });
  let addData;
  if (orders) {
    addData = await UserOrders.findOneAndUpdate(
      { user: user._id },
      {
        $addToSet: {
          whishlist: {
            productId: id,
          },
        },
      },
      { new: true }
    );
  } else {
    addData = await UserOrders.create({
      user: user._id,
      whishlist: [
        {
          productId: id,
        },
      ],
    });
  }

  res
    .status(200)
    .json(new ApiResponce(200, addData, "added in whishlist successfully"));
});

const acessUserOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "Unauthorize person plz login");
  }
  const userOrder = await UserOrders.findOne({ user: user._id });
  res.status(200).json(new ApiResponce(200, userOrder, "done"));
});

const removeUserOrdersInWhishlist = asyncHandler(async (req, res) => {
  const { id, color } = req.params;
  const user = req.user;
  const findUser = await User.findById(user._id);
  if (!findUser) {
    throw new ApiError(401, "Invalid user plz login again");
  }
  const findUserOrder = await UserOrders.findOneAndUpdate(
    { user: user._id },
    {
      $pull: {
        whishlist: { productId: id, color },
      },
    },
    { new: true }
  );
  if (!findUserOrder) {
    throw new ApiError(400, "user does not add this product in whishlist");
  }
  res
    .status(200)
    .json(new ApiResponce(200, findUserOrder, "product remove successfully"));
});

export { addProductInWhishlist, acessUserOrders, removeUserOrdersInWhishlist };
