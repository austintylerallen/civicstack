import express from "express";
import AuditLog from "../models/AuditLog.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ✅ GET /admin/audit-logs — Get all audit logs
router.get("/audit-logs", verifyToken, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit to latest 100 logs for now

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching audit logs:", err);
    res.status(500).json({ message: "Server error fetching logs." });
  }
});

export default router;
