import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";

const createToken = async (payload, secret, expire) => {
  const token = await jwt.sign(payload, secret, {
    expiresIn: expire,
  });
  return token;
};

const verifyToken = async (token, secret) => {
  try {
    const verification = await jwt.verify(token, secret);
    return verification;
  } catch (error) {
    throw new ApiError(400, "invalid token");
  }
};

export { createToken, verifyToken };
