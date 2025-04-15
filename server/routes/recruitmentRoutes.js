import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import Recruitment from "../models/RecruitmentRequest.js";
import JobPost from "../models/Job.js";
import Application from "../models/Application.js";

const router = express.Router();

// 📂 Upload config for resumes
const upload = multer({
  dest: "uploads/resumes/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.includes(ext));
  },
});

// ✅ ADMIN: Create internal recruitment request
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const newRecruitment = await Recruitment.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(newRecruitment);
  } catch (err) {
    console.error("Error creating recruitment entry:", err);
    res.status(500).json({ message: "Failed to create recruitment entry" });
  }
});

// ✅ ADMIN: Get internal recruitment requests
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const recruitments = await Recruitment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(recruitments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recruitments" });
  }
});

// ✅ ADMIN: Update status
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// ✅ ADMIN: Update notes
router.patch("/:id/notes", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notes" });
  }
});

// ✅ ADMIN: Delete internal recruitment entry
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete record" });
  }
});


// =============================
// 🟢 PUBLIC JOB POSTING SYSTEM
// =============================

// 🟢 GET all public job posts
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await JobPost.find({ status: "Open" }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// 🔐 ADMIN: Post a new job
router.post("/jobs", verifyToken, isAdmin, async (req, res) => {
  try {
    const job = await JobPost.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(job);
  } catch {
    res.status(500).json({ message: "Failed to post job" });
  }
});

// 🟢 PUBLIC: Submit a job application
router.post("/apply/:jobId", upload.single("resume"), async (req, res) => {
  try {
    const application = await Application.create({
      jobId: req.params.jobId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      resume: `/uploads/resumes/${req.file.filename}`,
    });
    res.status(201).json(application);
  } catch (err) {
    console.error("❌ Error applying:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

export default router;
