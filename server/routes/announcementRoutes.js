import express from "express";
import Announcement from "../models/Announcement.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// ✅ Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ GET all announcements
router.get("/", verifyToken, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

// ✅ POST new announcement WITH attachment support
router.post("/", verifyToken, upload.single("attachment"), async (req, res) => {
  try {
    const { title, content, department, pinned } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newAnnouncement = await Announcement.create({
      title,
      content,
      department,
      pinned,
      author: req.user.id,
      attachment: fileUrl,
    });

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error("❌ Error creating announcement:", err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

// ✅ DELETE announcement
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

export default router;
