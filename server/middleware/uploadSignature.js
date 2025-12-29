import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "./public/uploads/signatures";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// UPLOAD SIGNATURE IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const userId = req.user?.id || "unknown";
    const extension = path.extname(file.originalname) || ".png";
    const newFilename = `signature_${userId}_${timestamp}${extension}`;
    cb(null, newFilename);
  },
});

var uploadSignature = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  },
  fileFilter: function (req, file, cb) {
    // Allow only image files
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, JPG, PNG, WEBP)"));
    }
  },
});

export default uploadSignature;
