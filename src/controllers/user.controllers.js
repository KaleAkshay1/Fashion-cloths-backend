import ApiResponce from "../utils/ApiResponce.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import sendOTP from "../utils/sendOTP.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createToken, verifyToken } from "../utils/createAndAccessJwttoken.js";
import { cookieAccessOptions } from "../constant.js";

const userLogin = asyncHandler(async (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid Username");
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
        { username: user.username, email: user.email },
        "Login successfully"
      )
    );
});

const userRegister = asyncHandler(async (req, res) => {
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  if ([username, email, password].some((ele) => ele === "")) {
    throw new ApiError(400, "All fields require");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(
      400,
      "Username is alredy exist plz try different username"
    );
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
    { email, otp, username, password },
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
      username: check_otp.username,
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
  res.status(401).json(new ApiResponce(401, "", "unaithoroze user"));
});

const sendData = (req, res) => {
  const { username } = req.body;
  res.send(username);
};

const prac = (req, res) => {
  console.log(req.user);
  res.send("data");
};

const checkUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponce(200, req.user, "login successfull"));
});

export {
  getUserDetail,
  sendData,
  userRegister,
  userLogin,
  checkOtp,
  logoutUser,
  googleLogout,
  prac,
  checkUser,
};
