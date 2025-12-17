import express from "express";
import { getAllEmails, createEmail } from "../controllers/emailControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/").get(protectAdminRoute, getAllEmails).post(createEmail);

export default router;
