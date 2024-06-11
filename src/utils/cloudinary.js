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

const deleteFromCloudinary = async (path, fold) => {
  try {
    if (!path || !fold) {
      console.log("Invalid path or folder provided");
      return null;
    }
    const pathParts = path.split("Myntra/");
    if (pathParts.length < 2) {
      console.log("Invalid path format");
      return null;
    }

    const filePart = pathParts[1].split(".")[0];
    const publicId = `Myntra/${filePart}`;

    const response = await cloudinary.uploader.destroy(publicId);

    if (response.result === "not found") {
      console.log(`Resource not found on Cloudinary: ${publicId}`);
    }
    return response;
  } catch (error) {
    console.error("Error occurred while deleting file on Cloudinary", error);
    return null;
  }
};

export { uplodeOnCloudinary, deleteFromCloudinary };
