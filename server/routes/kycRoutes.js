import express from "express";
import { startKYC, register, claimKYC } from "../controllers/kycControllers.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import axios from "axios";

const router = express.Router();

router.route("/start").get(protectRoute, startKYC);
router.route("/register").post(protectRoute, register);
router.route("/claim").post(protectRoute, claimKYC);

router.get("/image",protectRoute, async (req, res) => {
  const imageUrl = req.query.imageUrl;
  if (!imageUrl) {
    return res.status(400).send("Missing imageUrl parameter");
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "stream", // rất quan trọng
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res); // đây là stream, nên dùng được
  } catch (error) {
    console.error("Image proxy error:", error.message);
    res.status(500).send("Failed to fetch image");
  }
});

export default router;
