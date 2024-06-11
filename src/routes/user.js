import express from "express";
import {
  checkOtp,
  getUserDetail,
  userLogin,
  userRegister,
  logoutUser,
  googleLogout,
  updateUserAccount,
  sendOTPForForgotPassword,
  checkOtpForForgotPassword,
  changePassword,
} from "../controllers/user.controllers.js";
import verifyUser from "../Middelware/auth.middelware.js";
import { uplode } from "../Middelware/multer.midelware.js";

const route = express.Router();

route.post("/register", userRegister);
route.post("/check-otp", checkOtp);
route.post("/login", userLogin);
route.get("/check-user", verifyUser, getUserDetail);
route.get("/logout", verifyUser, logoutUser);
route.get("/logout-with-google", verifyUser, googleLogout);
route.post("/forgot-password", sendOTPForForgotPassword);
route.post("/forgot-password-otp", checkOtpForForgotPassword);
route.post("/change-password", changePassword);
route.post(
  "/update-account",
  verifyUser,
  uplode.single("profile_image"),
  updateUserAccount
);

export default route;
