import express from "express";
import {
  accessMoreItems,
  fetchFilterData,
  fetchItemsData,
  filteredItems,
  reletedItemsOfSelectedProduct,
  seeDetailOfProduct,
} from "../controllers/items.controller.js";

const route = express.Router();

route.get("/fetch-filter-data", fetchFilterData);
route.get("/fetch-items-filtered-data", filteredItems);
route.get("/fetch-items-data", fetchItemsData);
route.get("/fetch-related-items/:id", reletedItemsOfSelectedProduct);
route.get("/see-detail-of-product/:id", seeDetailOfProduct);
route.get("/fetch-items-data/:start", accessMoreItems);

export default route;
