import User from "./models/user.model.js";

const passportConfiguratuion = async function (
  request,
  accessToken,
  refreshToken,
  profile,
  done
) {
  try {
    const data = await User.findOne({ googleId: profile.id }).select(
      "-password -createdAt -updatedAt"
    );
    let user;
    if (!data) {
      user = await User.findOne({ email: profile.email });
    } else {
      return done(null, data);
    }
    if (!user && !data) {
      const data = await User.create({
        username: profile.email.split("@gmail.com")[0],
        email: profile.email,
        profile_image: profile.picture,
        googleId: profile.id,
      });
      return done(null, data);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
};

const passConfigureData = {
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "/api/user/google/login",
  scope: ["email", "profile"],
};

export { passportConfiguratuion, passConfigureData };
