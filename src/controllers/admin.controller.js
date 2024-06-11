import asyncHandler from "../utils/asyncHandler.js";
import { Item } from "../models/Items.model.js";
import ApiResponce from "../utils/ApiResponce.js";

const findItemsList = asyncHandler(async (req, res) => {
  const user = req.user;
  const items = await Item.find({ owner: user._id }).limit(12);
  res.status(200).json(new ApiResponce(200, items, "done"));
});

export { findItemsList };
