import express from "express";
import {
  checkOtp,
  getUserDetail,
  userLogin,
  userRegister,
  logoutUser,
  googleLogout,
  prac,
  checkUser,
} from "../controllers/user.controllers.js";
import verifyUser from "../Middelware/auth.middelware.js";

const route = express.Router();

route.post("/register", userRegister);
route.post("/check-otp", checkOtp);
route.post("/login", userLogin);
route.get("/check-owner", verifyUser, getUserDetail);
route.get("/prac", prac);
route.get("/logout", verifyUser, logoutUser);
route.get("/logout-with-google", verifyUser, googleLogout);
route.get("/check-auth", checkUser);

export default route;
