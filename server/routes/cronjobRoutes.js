import express from "express";
import { runCronjob, testTreeDieTime } from "../controllers/cronjobControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";
import { protectAdminRoute } from "../controllers/adminControllers.js";

const router = express.Router();

router.route("/run").post(protectAdminRoute, runCronjob);
router.route("/test-tree-dietime").post(protectAdminRoute, testTreeDieTime);
router.route("/test-tree-dietime/:treeId").get(testTreeDieTime);

export default router;
