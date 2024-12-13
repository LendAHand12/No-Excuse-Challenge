import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  allowedFormats: ["jpg", "png", "jpeg", "webp", "svg"],
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.originalname);
  },
});

const uploadCloud = multer({
  storage,
  limits: {
    fileSize: 5000000, // maximum file size of 5 MB per file
  },

  // Configure the list of file types that are valid
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png|webp|svg)$/)) {
      return cb(new Error("Unsupported file format"));
    }
    cb(undefined, true);
  },
});

export default uploadCloud;
