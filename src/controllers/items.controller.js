import { Item } from "../models/Items.model.js";
import { History } from "../models/history.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponce from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const fetchFilterData = asyncHandler(async (req, res) => {
  const result = await Item.aggregate([
    {
      $group: {
        _id: "$gender",
        brands: { $addToSet: "$brand" },
        categories: { $addToSet: "$category" },
        sizes: { $push: { $objectToArray: "$sizes" } },
        details: { $push: { $objectToArray: "$details" } },
      },
    },
    {
      $project: {
        _id: 0,
        gender: "$_id",
        brands: 1,
        categories: 1,
        sizes: {
          $reduce: {
            input: "$sizes",
            initialValue: [],
            in: { $setUnion: ["$$this.k", "$$value"] },
          },
        },
        details: {
          $reduce: {
            input: "$details",
            initialValue: [],
            in: { $setUnion: ["$$this.k", "$$value"] },
          },
        },
      },
    },
  ]);

  const details = await Item.aggregate([
    {
      $group: {
        _id: "$gender",
        details: { $push: "$details" },
      },
    },
    {
      $unwind: "$details",
    },
    {
      $project: {
        _id: 0,
        gender: "$_id",
        details: { $objectToArray: "$details" },
      },
    },
    {
      $unwind: "$details",
    },
    {
      $group: {
        _id: { gender: "$gender", key: "$details.k" },
        values: { $addToSet: "$details.v" },
      },
    },
    {
      $group: {
        _id: "$_id.gender",
        details: {
          $push: {
            k: "$_id.key",
            v: "$values",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        gender: "$_id",
        details: {
          $arrayToObject: {
            $map: {
              input: "$details",
              as: "item",
              in: {
                k: "$$item.k",
                v: {
                  $reduce: {
                    input: "$$item.v",
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        "$$value",
                        {
                          $cond: {
                            if: { $isArray: "$$this" },
                            then: "$$this",
                            else: ["$$this"],
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ]);

  const category = {};
  for (let i of result) {
    if (i.gender === "women") {
      category["women"] = i;
    } else if (i.gender === "men") {
      category["men"] = i;
    } else if (i.gender === "unisex") {
      category["unisex"] = i;
    }
  }
  for (let i of details) {
    if (i.gender === "women") {
      category["women"]["details"] = i.details;
    } else if (i.gender === "men") {
      category["men"]["details"] = i.details;
    } else if (i.gender === "unisex") {
      category["unisex"]["details"] = i.details;
    }
  }
  res.status(200).json(new ApiResponce(200, category));
});

const fetchItemsData = asyncHandler(async (req, res) => {
  const women = await Item.find({ gender: "women" })
    .sort({ "priceInfo.finalPrice": -1 })
    .limit(8);
  const men = await Item.find({ gender: "men" })
    .sort({ "priceInfo.finalPrice": -1 })
    .limit(6);
  const kids = await Item.find({ gender: "kids" })
    .sort({ "priceInfo.finalPrice": -1 })
    .limit(4);
  const data = [...women, ...men, ...kids];
  res.status(200).json(new ApiResponce(200, data, "done"));
});

const accessMoreItems = asyncHandler(async (req, res) => {
  const { start } = req.params;
  const filterForDatabaseCall = {};
  const filters = req.query;
  for (let i in filters) {
    if (["gender", "brand", "category"].some((ele) => ele === i)) {
      filterForDatabaseCall[i] = filters[i];
    } else if (i === "minPrice" || i === "maxPrice") {
    } else if (i === "sizes") {
      filterForDatabaseCall[`sizes.${filters[i]}`] = { $ne: 0 };
    } else {
      filterForDatabaseCall[`details.${[i]}`] = filters[i];
    }
  }
  if (filters["minPrice"] && filters["maxPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $gte: filters["minPrice"],
      $lte: filters["maxPrice"],
    };
  } else if (filters["maxPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $lte: filters["maxPrice"],
    };
  } else if (filters["minPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $gte: filters["minPrice"],
    };
  }
  if (!start) {
    throw new ApiError(400, "some value is missing");
  }
  const data = await Item.find(filterForDatabaseCall)
    .skip(start)
    .limit(process.env.END_VAL_FETCHING_MONGOSE_DATA);
  if (!data) {
    throw new ApiError("Invalid Category");
  }
  res.status(200).json(new ApiResponce(200, data, "Fetch data succesfully"));
});

const filteredItems = asyncHandler(async (req, res) => {
  const filters = req.query;
  const filterForDatabaseCall = {};
  for (let i in filters) {
    if (["gender", "brand", "category"].some((ele) => ele === i)) {
      filterForDatabaseCall[i] = filters[i];
    } else if (i === "sizes") {
      filterForDatabaseCall[`sizes.${filters[i]}`] = { $ne: 0 };
    } else if (i === "minPrice" || i === "maxPrice") {
    } else {
      filterForDatabaseCall[`details.${[i]}`] = filters[i];
    }
  }
  if (filters["minPrice"] && filters["maxPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $gte: filters["minPrice"],
      $lte: filters["maxPrice"],
    };
  } else if (filters["maxPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $lte: filters["maxPrice"],
    };
  } else if (filters["minPrice"]) {
    filterForDatabaseCall["priceInfo.finalPrice"] = {
      $gte: filters["minPrice"],
    };
  }
  let result = {};
  if (Object.keys(filters).some((ele) => ele === "category")) {
    const data = await Item.aggregate([
      {
        $match: {
          gender: filters["gender"],
          category: filters["category"],
        },
      },
      {
        $project: {
          details: { $objectToArray: "$details" },
        },
      },
      {
        $unwind: "$details",
      },
      {
        $group: {
          _id: "$details.k",
          uniqueValues: { $addToSet: "$details.v" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    result = data.reduce((acc, item) => {
      acc[item._id] = item.uniqueValues;
      return acc;
    }, {});
  }
  const count = await Item.countDocuments(filterForDatabaseCall);
  const data = await Item.find(filterForDatabaseCall).limit(
    process.env.END_VAL_FETCHING_MONGOSE_DATA
  );
  res.json(new ApiResponce(200, { data, count, details: result }));
});

const reletedItemsOfSelectedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Item.findOne({ _id: id });
  if (!product) {
    throw new ApiError(400, "Invalid Product ID");
  }
  const products = await Item.find({
    name: product.name,
    category: product.category,
    details: product.details,
  });
  res.status(200).json(new ApiResponce(200, products, "done"));
});

const seeDetailOfProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await Item.findById(id);
  if (!data) {
    throw ApiError(400, "Invalid Product");
  }
  res.status(200).json(new ApiResponce(200, data, "done"));
});

const similarItems = asyncHandler(async (req, res) => {
  const { gender, category, brand } = req.query;
  if (!gender || !category || !brand) {
    throw new ApiError(400, "Gender and Category required");
  }
  let data = await Item.find({ gender, category, brand });
  if (data.length < 15) {
    data = await Item.find({ gender, category });
  }
  if (data.length < 15) {
    data = await Item.find({ category });
  }
  const shuffelData = data.sort(() => Math.random() - 0.5);
  res.status(200).json(new ApiResponce(200, shuffelData.slice(0, 15), "done"));
});

const accessRecentlyViewed = asyncHandler(async (req, res) => {
  const user = req.user;
  const data = await History.findOne({
    user: user._id,
  }).populate("items");
  res.status(200).json(new ApiResponce(200, data?.items, "done"));
});

const addItemsInHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const itemExist = await History.findOne({
    user: user._id,
    items: { $in: [id] },
  });

  if (itemExist) {
    console.log("Item already exists in history");
    return res
      .status(200)
      .json(new ApiResponce(200, itemExist, "Item already exists in history"));
  } else {
    const response = await History.findOneAndUpdate(
      { user: user._id },
      {
        $push: {
          items: {
            $each: [id],
            $position: 0,
          },
        },
      },
      { new: true, upsert: true }
    );

    if (response.items.length > 14) {
      console.log("History exceeds 14 items, removing the last item");
      await History.findOneAndUpdate(
        { user: user._id },
        { $pop: { items: 1 } },
        { new: true }
      );
    }

    res
      .status(200)
      .json(new ApiResponce(200, response.items, "Item added to history"));
  }
});

export {
  fetchItemsData,
  accessMoreItems,
  fetchFilterData,
  filteredItems,
  reletedItemsOfSelectedProduct,
  seeDetailOfProduct,
  similarItems,
  accessRecentlyViewed,
  addItemsInHistory,
};
