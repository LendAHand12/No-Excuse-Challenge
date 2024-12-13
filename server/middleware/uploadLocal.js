import multer from "multer";

// UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/posts");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var uploadLocal = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    cb(null, true);
  },
});

export default uploadLocal;
