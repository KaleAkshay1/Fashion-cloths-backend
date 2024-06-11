import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const verifyUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    const refreshtoken = req.cookies?.refreshToken;
    if (!refreshtoken) {
      req.user = null;
      throw new ApiError(401, "unauthrize");
    }
    const decodedRefreshToken = jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedRefreshToken) {
      req.user = null;
      throw new ApiError(401, "unauthrize Pleze login");
    }
    const user = await User.findById(decodedRefreshToken?.id).select(
      "-password -createdAt -updatedAt "
    );

    if (!user) {
      req.user = null;
      throw new ApiError(401, "unauthrize Pleze login");
    }
    if (user.refreshToken === refreshtoken) {
      const person = await user.genrateAccessToken();
      if (!person) {
        req.user = null;
        throw new ApiError(401, "user not found");
      }
      req.user = user;
      console.log(user);
      res.cookie("accessToken", person);
      next();
    }
    req.user = null;
    throw new ApiError(401, "unauthorize req  plese login");
  }

  const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);

  if (!decodedToken) {
    req.user = null;
    throw new ApiError(400, "Invalid Token");
  }
  const user = await User.findOne({ _id: decodedToken?.id }).select(
    "-password -createdAt -updatedAt -refreshToken"
  );
  if (!user) {
    req.user = null;
    throw new ApiError(400, "Invalid Token");
  }
  req.user = user;
  next();
});

const reLogin = asyncHandler(async (req, res) => {});

export default verifyUser;
