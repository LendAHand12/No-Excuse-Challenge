import express from "express";
import { bankWebhookNotify, bankWebhookVerify } from "../controllers/bankWebhookControllers.js";

const router = express.Router();

router.route("/notify").post(bankWebhookNotify);
router.route("/verify").get(bankWebhookVerify);

export default router;
