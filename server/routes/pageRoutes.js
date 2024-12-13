import express from "express";
import {
  getAllPages,
  createPage,
  getPageDetailsPageName,
  updatePageDetailsPageName,
} from "../controllers/pageControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAllPages).post(createPage);
router
  .route("/:pageName")
  .get(getPageDetailsPageName)
  .put(updatePageDetailsPageName);

export default router;
