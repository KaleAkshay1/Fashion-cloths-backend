import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplodeOnCloudinary = async (path, fold) => {
  try {
    if (!path) return null;
    let responce = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      folder: `Myntra/${fold}`,
    });
    await fs.unlinkSync(path);
    return responce;
  } catch (error) {
    console.log("clodinary Error is ", error);
    fs.unlinkSync(path);
    return null;
  }
};

const deleteFromCloudinary = async (path) => {
  try {
    if (!path) return null;
    const a = path.split("Myntra/");
    const b = a[1].split(".");
    const responce = await cloudinary.uploader.destroy(b[0]);
    return responce;
  } catch (error) {
    console.log("this error ocure when deleted file on cloudinatry", error);
    return null;
  }
};

export { uplodeOnCloudinary, deleteFromCloudinary };
