import express from "express";
import Issue from "../models/Issue.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import { Parser } from "json2csv";

const router = express.Router();

// ✅ GET all issues (Admins see archived too)
router.get("/", verifyToken, async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    await Issue.updateMany(
      { createdAt: { $lt: oneYearAgo }, archived: { $ne: true } },
      { $set: { archived: true } }
    );

    const issuesQuery = req.user?.role === "admin" ? {} : { archived: false };

    const issues = await Issue.find(issuesQuery)
      .populate("createdBy", "name email")
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(issues);
  } catch (err) {
    console.error("❌ Error fetching issues:", err);
    res.status(500).json({ message: "Server error fetching issues." });
  }
});

// ✅ PATCH update issue status
router.patch("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["New", "In Progress", "Resolved"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const issue = await Issue.findById(id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const oldStatus = issue.status;
    issue.status = status;
    await issue.save();

    await AuditLog.create({
      action: "Updated Status",
      user: req.user.id,
      targetId: issue._id,
      targetType: "Issue",
      metadata: { from: oldStatus, to: status },
    });

    await Notification.create({
      type: "status_update",
      message: `Status updated to "${status}" for "${issue.title}"`,
      issueId: issue._id,
    });

    res.json({ success: true, updated: issue });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST comment
router.post("/:id/comments", verifyToken, async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const comment = {
    text: req.body.text,
    author: req.user.id,
  };

  issue.comments.push(comment);
  await issue.save();

  const createdComment = issue.comments.at(-1);

  await AuditLog.create({
    action: "Added Comment",
    user: req.user.id,
    targetId: issue._id,
    targetType: "Comment",
    metadata: { commentId: createdComment._id, text: comment.text },
  });

  await Notification.create({
    type: "new_comment",
    message: `New comment on "${issue.title}": "${comment.text}"`,
    issueId: issue._id,
  });

  res.status(201).json(createdComment);
});

// ✅ DELETE comment – admin only
router.delete("/:issueId/comments/:commentId", verifyToken, isAdmin, async (req, res) => {
  const { issueId, commentId } = req.params;

  const issue = await Issue.findById(issueId);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  const comment = issue.comments.find((c) => c._id.toString() === commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  issue.comments = issue.comments.filter((c) => c._id.toString() !== commentId);
  await issue.save();

  await AuditLog.create({
    action: "Deleted Comment",
    user: req.user.id,
    targetId: issue._id,
    targetType: "Comment",
    metadata: { commentId },
  });

  res.json({ success: true, commentId });
});

// ✅ Archive issue manually (should be unused now)
router.patch("/:id/archive", verifyToken, isAdmin, async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });

  issue.archived = true;
  await issue.save();

  await AuditLog.create({
    action: "Archived Issue",
    user: req.user.id,
    targetId: issue._id,
    targetType: "Issue",
  });

  res.json({ success: true, message: "Issue archived", issue });
});

// ✅ CSV Export
router.get("/export", verifyToken, async (req, res) => {
  try {
    const issues = await Issue.find({ archived: false })
      .populate("createdBy", "name email")
      .lean();

    const fields = ["title", "department", "priority", "status", "createdAt"];
    const parser = new Parser({ fields });
    const csv = parser.parse(issues);

    res.header("Content-Type", "text/csv");
    res.attachment("issues_export.csv");
    res.send(csv);
  } catch (err) {
    console.error("❌ Failed to export issues:", err);
    res.status(500).json({ error: "Error generating CSV" });
  }
});

// ✅ New Issue – used from the frontend form
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, department, priority } = req.body;

    const issue = await Issue.create({
      title,
      description,
      department,
      priority,
      createdBy: req.user.id,
    });

    await AuditLog.create({
      action: "Created Issue",
      user: req.user.id,
      targetId: issue._id,
      targetType: "Issue",
      metadata: { title, department },
    });

    await Notification.create({
      type: "new_issue",
      message: `New issue submitted: "${title}"`,
      issueId: issue._id,
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error("❌ Failed to create issue:", err);
    res.status(500).json({ error: "Error creating issue" });
  }
});

export default router;
