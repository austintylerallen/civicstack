import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import Setting from "../models/Setting.js"; // 🔧 You'll need a model

const router = express.Router();

// GET all settings (admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Failed to load settings" });
  }
});

// GET one setting by key
router.get("/:key", verifyToken, isAdmin, async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ message: "Not found" });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch setting" });
  }
});

// POST or update a setting (upsert)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: "Failed to save setting" });
  }
});

// DELETE a setting by key
router.delete("/:key", verifyToken, isAdmin, async (req, res) => {
  try {
    await Setting.findOneAndDelete({ key: req.params.key });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete setting" });
  }
});

export default router;
