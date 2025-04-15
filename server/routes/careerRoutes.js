import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Resume upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/resumes";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Email config (Ethereal or SMTP)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

// 🟢 Public - Get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// 🟡 Admin - Create a job
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json(job);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Failed to create job" });
  }
});

// 🟡 Admin - Delete a job
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job" });
  }
});

// 🔵 Public - Apply to a job
router.post("/apply", upload.single("resume"), async (req, res) => {
  const { fullName, email, jobId } = req.body;
  try {
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    const app = await Application.create({
      fullName,
      email,
      job: jobId,
      resumeUrl,
    });

    // Send confirmation email
    await transporter.sendMail({
      from: '"CivicStack Careers" <no-reply@civicstack.gov>',
      to: email,
      subject: "Your job application was received",
      text: `Hi ${fullName},\n\nThank you for applying. We've received your application and will follow up soon.\n\n- CivicStack HR Team`,
    });

    res.status(201).json({ message: "Application submitted", application: app });
  } catch (err) {
    console.error("Error applying:", err);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// 🟡 Admin - Get all applicants
router.get("/applicants", verifyToken, isAdmin, async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("job", "title")
      .sort({ createdAt: -1 });

    const formatted = apps.map((a) => ({
      _id: a._id,
      fullName: a.fullName,
      email: a.email,
      jobTitle: a.job?.title || "Unknown",
      resumeUrl: a.resumeUrl,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});

export default router;
