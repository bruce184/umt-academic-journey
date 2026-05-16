import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { NotificationController } from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", requireAuth, NotificationController.getNotifications);
router.get("/unread-count", requireAuth, NotificationController.getUnreadCount);
router.patch("/:id/read", requireAuth, NotificationController.markAsRead);
router.post("/mark-read", requireAuth, NotificationController.markBatchRead);
router.post("/mark-all-read", requireAuth, NotificationController.markAllRead);

export default router;
