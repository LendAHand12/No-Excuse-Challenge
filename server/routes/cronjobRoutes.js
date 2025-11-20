import express from "express";
import { runCronjob, testTreeDieTime } from "../controllers/cronjobControllers.js";
import { isAdmin, protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/run").post(protectRoute, isAdmin, runCronjob);
router.route("/test-tree-dietime").post(protectRoute, isAdmin, testTreeDieTime);
router.route("/test-tree-dietime/:treeId").get(testTreeDieTime);

export default router;
