import express from "express";
import { getAllEmails, createEmail } from "../controllers/emailControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protectRoute, isAdmin, getAllEmails).post(createEmail);

export default router;
