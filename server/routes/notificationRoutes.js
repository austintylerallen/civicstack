import express from "express";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all notifications (latest first)
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (err) {
    console.error("Failed to get notifications", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Mark notification as read
router.patch("/:id/read", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notif);
  } catch (err) {
    console.error("Failed to update notification", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/notifications", verifyToken, isAdmin, async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(10); // adjustable
  
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Server error getting notifications" });
    }
  });
  

export default router;
