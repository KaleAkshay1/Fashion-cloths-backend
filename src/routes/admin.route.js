import express from "express";
import verifyUser from "../Middelware/auth.middelware.js";
import { findItemsList } from "../controllers/admin.controller.js";
const routes = express.Router();

routes.get("/acess-items-list", verifyUser, findItemsList);

export default routes;
