import express from "express";
import Issue from "../models/Issue.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import AuditLog from "../models/AuditLog.js";
import dayjs from "dayjs";
import Notification from "../models/Notification.js";
import FormRequest from "../models/FormRequest.js";


const router = express.Router();


const departments = [
  "Assessor", "Communications", "Community Development", "County Manager", "County Treasurer",
  "Detention Center", "Fire Department", "Fire Rescue", "Flood Commission", "Human Resources",
  "Information Technology", "Public Health & Assistance", "Purchasing Department",
  "Road Department", "Sheriff"
];

// ✅ GET analytics – protected (for the dashboard)
router.get("/analytics", verifyToken, async (req, res) => {
  try {
    // ✅ Auto-archive issues older than 1 year
    const oneYearAgo = dayjs().subtract(1, "year").toDate();
    await Issue.updateMany(
      { createdAt: { $lt: oneYearAgo }, archived: { $ne: true } },
      { $set: { archived: true } }
    );

    const totalIssues = await Issue.countDocuments({ archived: false });

    const issuesByStatus = await Issue.aggregate([
      { $match: { archived: false } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const issuesByDepartment = await Issue.aggregate([
      { $match: { archived: false } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    const issuesByPriority = await Issue.aggregate([
      { $match: { archived: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const recentIssues = await Issue.find({ archived: false })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title department status createdAt");

    // ✅ FORM ANALYTICS
    const totalForms = await FormRequest.countDocuments();

    const formsByTypeAgg = await FormRequest.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    const formsByStatusAgg = await FormRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const formsByType = formsByTypeAgg.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      {}
    );
    const formsByStatus = formsByStatusAgg.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      {}
    );

    // ✅ RECENT ACTIVITY FEED (from Audit Log)
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("action user module createdAt")
      .populate("user", "name");

    // ✅ DEPARTMENT SUMMARY
    const departmentSummary = await Promise.all(
      departments.map(async (dept) => {
        const openIssues = await Issue.countDocuments({ department: dept, archived: false });
        const formCount = await FormRequest.countDocuments({ department: dept });
        return { department: dept, openIssues, formCount };
      })
    );

    res.status(200).json({
      totalIssues,
      issuesByStatus: issuesByStatus.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
      issuesByDepartment: issuesByDepartment.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
      issuesByPriority: issuesByPriority.reduce(
        (acc, { _id, count }) => ({ ...acc, [_id]: count }),
        {}
      ),
      recentIssues,
      totalForms,
      formsByType,
      formsByStatus,
      recentActivity,
      departmentSummary, // ✅ added
    });
  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Server error fetching analytics." });
  }
});

  


// ✅ GET /admin/audit-logs — only admins
router.get("/audit-logs", verifyToken, isAdmin, async (req, res) => {
    try {
      const logs = await AuditLog.find()
        .populate("user", "name email")
        .sort({ timestamp: -1 })
        .limit(50); // you can change or paginate this later
  
      res.status(200).json(logs);
    } catch (err) {
      console.error("❌ Error fetching audit logs:", err);
      res.status(500).json({ message: "Server error fetching audit logs." });
    }
  });


// 🔔 Get all notifications (latest first)
router.get("/notifications", verifyToken, isAdmin, async (req, res) => {
    try {
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(20); // adjust as needed
  
      res.status(200).json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Server error getting notifications" });
    }
  });
  
  // ✅ Mark notification as read
  router.patch("/notifications/:id/read", verifyToken, isAdmin, async (req, res) => {
    try {
      const notif = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
  
      if (!notif) return res.status(404).json({ message: "Notification not found" });
      res.status(200).json(notif);
    } catch (err) {
      console.error("Error updating notification:", err);
      res.status(500).json({ message: "Server error updating notification" });
    }
  });
  

export default router;
