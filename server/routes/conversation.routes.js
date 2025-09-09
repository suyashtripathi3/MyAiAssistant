import express from "express";
import {
  saveConversation,
  getConversationHistory,
  clearHistory,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/save", saveConversation);
router.get("/:userId", getConversationHistory);
router.delete("/:userId", clearHistory);


export default router;
