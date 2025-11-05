import express from "express";
import {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  replyTicket,
  markResolved,
  closeTicket,
} from "../controllers/ticketControllers.js";
import { protectRoute, isAdmin } from "../middleware/authMiddleware.js";
import uploadTicket from "../middleware/uploadTicket.js";

const router = express.Router();

// Admin routes (must be before user routes to avoid conflicts)
router.route("/").get(protectRoute, isAdmin, getAllTickets);

// User routes
router.route("/").post(
  protectRoute,
  (req, res, next) => {
    uploadTicket.array("images", 5)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          error: err.message || "File upload error",
        });
      }
      next();
    });
  },
  createTicket
);
router.route("/user").get(protectRoute, getUserTickets);
router.route("/:id").get(protectRoute, getTicketById);

// Admin routes (continued)
router.route("/:id/reply").put(protectRoute, isAdmin, replyTicket);
router.route("/:id/resolve").put(protectRoute, isAdmin, markResolved);
router.route("/:id/close").put(protectRoute, isAdmin, closeTicket);

export default router;
