import express from "express";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// PATCH /api/users/profile - update logged-in user's profile
router.patch("/profile", verifyToken, async (req, res) => {
    try {
      const updates = req.body;
      const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  




export default router;
