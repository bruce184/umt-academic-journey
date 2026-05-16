import { Router } from "express";
import { MessageController } from "../controllers/messages.controller.js";

const router = Router();

// GET  /api/v1/messages/conversations/unread-count
// Must be BEFORE /:id to avoid conflict
router.get("/conversations/unread-count", MessageController.getUnreadCount);

// GET  /api/v1/messages/conversations          — list all conversations
// POST /api/v1/messages/conversations          — get or create a conversation
router.get("/conversations", MessageController.listConversations);
router.post("/conversations", MessageController.getOrCreateConversation);

// GET  /api/v1/messages/conversations/:id/messages  — list messages (paginated)
// POST /api/v1/messages/conversations/:id/messages  — send a message
router.get("/conversations/:id/messages", MessageController.listMessages);
router.post("/conversations/:id/messages", MessageController.sendMessage);

// PATCH /api/v1/messages/:id  — soft-delete a message
router.patch("/:id", MessageController.deleteMessage);

export default router;
