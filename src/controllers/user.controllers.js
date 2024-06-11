import ApiResponce from "../utils/ApiResponce.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import sendOTP from "../utils/sendOTP.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uplodeOnCloudinary,
} from "../utils/cloudinary.js";
import { createToken, verifyToken } from "../utils/createAndAccessJwttoken.js";
import { category, cookieAccessOptions } from "../constant.js";

const userLogin = asyncHandler(async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid Email");
  }
  const password_cheack = await user.isPasswordCorrect(password);
  if (!password_cheack) {
    throw new ApiError(400, "Invalid Password");
  }
  const token = await user.genrateAccessToken();
  const refreshToken = await user.genrateRefreshToken();
  if (!token || !refreshToken) {
    throw new ApiError(400, "plz try later");
  }
  const data = await User.findByIdAndUpdate(
    user._id,
    { refreshToken },
    { new: true }
  );
  req.user = user;
  res
    .cookie("accessToken", token)
    .cookie("refreshToken", refreshToken)
    .status(200)
    .json(
      new ApiResponce(
        200,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          _id: user._id,
          profile_image: user.profile_image,
        },
        "Login successfully"
      )
    );
});

const userRegister = asyncHandler(async (req, res) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const phone = req.body.phone;
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if ([firstName, lastName, phone, email, password].some((ele) => ele === "")) {
    throw new ApiError(400, "All fields require");
  }

  if (!email.endsWith("@gmail.com")) {
    throw new ApiError(400, "plz use valid email");
  }
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ApiError(400, "Email is alredy exists plz try different email");
  }
  const otp = Math.floor(100000 + Math.random() * 899999);
  const message = `one time password is ${otp}`;

  const mailResponce = await sendOTP(
    email,
    "Confirmation of registration OTP",
    message
  );
  if (!mailResponce) {
    throw new ApiError(500, "something went wrong when send otp");
  }

  const token = await createToken(
    { email, otp, firstName, lastName, phone, password },
    process.env.REGISTER_TOKEN_SECRET,
    process.env.REGISTER_TOKEN_EXPIRY
  );
  res
    .status(200)
    .cookie("register", token, cookieAccessOptions)
    .json(new ApiResponce(200, { email, data: true }, "check Otp"));
});

const checkOtp = asyncHandler(async (req, res) => {
  const otp = req.body?.otp.trim();
  if (!otp) {
    throw new ApiError(400, "otp is require");
  }
  const token = req.cookies?.register;
  if (!token) {
    throw new ApiError(500, "plz try again");
  }
  const check_otp = await verifyToken(token, process.env.REGISTER_TOKEN_SECRET);
  if (otp === check_otp?.otp.toString()) {
    const user = await User.create({
      firstName: check_otp.firstName,
      lastName: check_otp.lastName,
      phone: check_otp.phone,
      password: check_otp.password,
      email: check_otp.email,
    });
    return res
      .clearCookie("register")
      .status(200)
      .json(new ApiResponce(200, true, "register successfully"));
  }
  return res.status(400).json(new ApiResponce(400, false, "invalid otp"));
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user = null;
    return res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json(new ApiResponce(200, true, "logout successfully"));
  }
  res.status(400).json(new ApiResponce(400, false, "user is not found"));
});

const googleLogout = asyncHandler(async (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .redirect("http://localhost:5173");
  });
});

const getUserDetail = asyncHandler((req, res) => {
  if (req.user) {
    return res
      .status(200)
      .json(new ApiResponce(200, req.user, "user is loged in"));
  }
  res.status(401).json(new ApiResponce(401, {}, "unaithoroze user"));
});

const updateUserAccount = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, gender } = req.body;
  if (!email || !gender || !phone || !lastName || !firstName) {
    throw new ApiError(400, "All fields are require");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(402, "Invalid User");
  }
  if (req.file?.path) {
    if (user?.profile_image) {
      const data = await deleteFromCloudinary(user.profile_image, "user");
      const file = await uplodeOnCloudinary(req.file?.path, "user");
      user.profile_image = file.url;
    } else {
      const file = await uplodeOnCloudinary(req.file?.path, "user");
      user.profile_image = file.url;
    }
  }
  if (user.firstName !== firstName) {
    user.firstName = firstName;
  }
  if (user.lastName !== lastName) {
    user.lastName = lastName;
  }
  if (user?.gender !== gender) {
    user.gender = gender;
  }
  if (user?.phone !== phone) {
    const number = String(phone).trim();
    if (number.length < 10 && number.length > 12) {
      throw new ApiError(400, "Invalid phone number");
    }
    user.phone = phone;
  }
  await user.save();
  res.status(200).json(
    new ApiResponce(
      200,
      {
        admin: user.admin,
        email: user.email,
        firstName: user.firstName,
        gender: user.gender,
        lastName: user.lastName,
        phone: user.phone,
        profile_image: user.profile_image,
      },
      "done"
    )
  );
});

const sendOTPForForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !email.endsWith("@gmail.com")) {
    throw new ApiError(400, "Enter Valid Email Id");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User not Exist With This Email");
  }
  const otp = Math.floor(100000 + Math.random() * 899999);
  const message = `one time password is ${otp}`;

  const mailResponce = await sendOTP(
    email,
    "Confirmation for forgot password",
    message
  );
  if (!mailResponce) {
    throw new ApiError(500, "something went wrong when send mail");
  }
  const token = await createToken(
    { otp, email },
    process.env.FORGOT_TOKEN_SECRET,
    process.env.FORGOT_TOKEN_EXPIRY
  );
  res
    .status(200)
    .cookie("forgot", token, cookieAccessOptions)
    .json(
      new ApiResponce(200, { data: true }, "check otp for forgot password")
    );
});

const checkOtpForForgotPassword = asyncHandler(async (req, res) => {
  const otp = req.body?.otp.trim();
  if (!otp) {
    throw new ApiError(400, "otp is require");
  }
  const token = req.cookies?.forgot;
  if (!token) {
    throw new ApiError(400, "plz send otp again");
  }
  const check_token = await verifyToken(token, process.env.FORGOT_TOKEN_SECRET);
  if (check_token.otp.toString() === otp) {
    return res
      .status(200)
      .clearCookie("forgot")
      .json(new ApiResponce(200, { data: true }, "done"));
  }
  throw new ApiError(400, "Invalid OTP");
});

const changePassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User is not Exist with this email");
  }
  user.password = password;
  await user.save();
  console.log(user);
  res.send(true);
});

export {
  getUserDetail,
  userRegister,
  userLogin,
  checkOtp,
  logoutUser,
  googleLogout,
  updateUserAccount,
  sendOTPForForgotPassword,
  checkOtpForForgotPassword,
  changePassword,
};
