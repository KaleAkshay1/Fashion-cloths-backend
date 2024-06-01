import express from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import {
  accessDataFromWhishlist,
  acessUserWhishlistData,
  addItemToWhishlist,
  removeFromWhishlist,
} from "../controllers/whishlist.controller.js";
const route = express.Router();

route.get("/add-item-in-whishlist/:id", verifyUser, addItemToWhishlist);
route.get("/fetch-items-from-whishlist", verifyUser, acessUserWhishlistData);
route.get("/remove-items-from-whishlist/:id", verifyUser, removeFromWhishlist);
route.get("/access-items-from-whishlist", verifyUser, accessDataFromWhishlist);

export default route;
