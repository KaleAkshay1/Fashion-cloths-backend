import express from "express";
import {
  accessMoreItems,
  accessRecentlyViewed,
  addItemsInHistory,
  fetchFilterData,
  fetchItemsData,
  filteredItems,
  reletedItemsOfSelectedProduct,
  seeDetailOfProduct,
  similarItems,
} from "../controllers/items.controller.js";
import verifyUser from "../Middelware/auth.middelware.js";

const route = express.Router();

route.get("/fetch-filter-data", fetchFilterData);
route.get("/fetch-items-filtered-data", filteredItems);
route.get("/fetch-items-data", fetchItemsData);
route.get("/fetch-related-items/:id", reletedItemsOfSelectedProduct);
route.get("/see-detail-of-product/:id", seeDetailOfProduct);
route.get("/fetch-items-data/:start", accessMoreItems);
route.get("/similar-item", similarItems);
route.get("/access-recently-view", verifyUser, accessRecentlyViewed);
route.get("/add-items-recetly-views/:id", verifyUser, addItemsInHistory);

export default route;
