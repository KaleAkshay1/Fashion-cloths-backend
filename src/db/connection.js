import mongoose from "mongoose";
import DB_NAME from "../constant.js";

async function connections() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("Database Connect");
  } catch (error) {
    console.log("Database Not Connect");
  }
}

export default connections;
