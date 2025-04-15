import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

router.post("/issues", async (req, res) => {
  const { name, email, title, description, department, priority } = req.body;

  if (!name || !email || !title || !department) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const issue = await Issue.create({
      title,
      description,
      department,
      priority,
      status: "New",
      createdBy: null,
      submittedBy: "public",
      contactInfo: { name, email }
    });

    res.status(201).json({ message: "Issue submitted", issue });
  } catch (err) {
    console.error("Public issue submit error:", err);
    res.status(500).json({ error: "Server error submitting issue." });
  }
});

export default router;
