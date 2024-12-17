import multer from "multer";

// UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/CCCD");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = originalName.substring(originalName.lastIndexOf("."));
    const newFilename = `${timestamp}${extension}`;
    cb(null, newFilename);
  },
});

var uploadLocal = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

export default uploadLocal;
