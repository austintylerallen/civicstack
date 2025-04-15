import express from "express";
import WorkOrder from "../models/WorkOrder.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET all work orders
router.get("/", verifyToken, async (req, res) => {
  try {
    const workOrders = await WorkOrder.find()
      .populate("requestedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(workOrders);
  } catch (err) {
    console.error("❌ Error fetching work orders:", err);
    res.status(500).json({ message: "Error fetching work orders" });
  }
});

// POST new work order
router.post("/", verifyToken, async (req, res) => {
  try {
    const newOrder = await WorkOrder.create({
      ...req.body,
      requestedBy: req.user.id,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("❌ Error creating work order:", err);
    res.status(500).json({ message: "Error creating work order" });
  }
});

// PATCH update work order status or assignment
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await WorkOrder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Error updating work order:", err);
    res.status(500).json({ message: "Error updating work order" });
  }
});

// DELETE work order – admin only
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await WorkOrder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting work order:", err);
    res.status(500).json({ message: "Error deleting work order" });
  }
});


// Update status of a work order
router.patch("/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await WorkOrder.findByIdAndUpdate(
        req.params.id,
        { $set: { status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: "Work order not found" });
      res.json(updated);
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  


export default router;
