import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import Oauth2Strtergy from "passport-google-oauth2";
import User from "./models/user.model.js";
import ApiError from "./utils/ApiError.js";
import { passConfigureData, passportConfiguratuion } from "./passport.js";

const app = express();

app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CROS_ORIGIN,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "30kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "30kb",
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "akya",
  })
);

//
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Oauth2Strtergy(passConfigureData, passportConfiguratuion));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.get("/api/user/google/login", (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    try {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect("http://localhost:5173/login");
      }
      req.logIn(user, async (err) => {
        if (err) {
          return next(err);
        }
        const owner = await User.findById(user._id);
        if (!owner) {
          throw new ApiError(400, "User not found");
        }
        const accessToken = await owner.genrateAccessToken();
        const refreshToken = await owner.genrateRefreshToken();
        await User.findByIdAndUpdate(owner._id, { refreshToken });
        return res
          .cookie("accessToken", accessToken)
          .cookie("refreshToken", refreshToken)
          .redirect("http://localhost:5173");
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});
//
import user from "./routes/user.js";

app.use("/api/user", user);

import product from "./routes/product.js";

app.use("/api/product", product);

import orders from "./routes/orders.js";

app.use("/api/orders", orders);

export default app;
