import express from "express";
import FormRequest from "../models/FormRequest.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import PDFDocument from "pdfkit";
import fs from "fs";

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/forms"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Submit a form (with attachments)
router.post("/", verifyToken, upload.array("attachments"), async (req, res) => {
  try {
    const files = req.files.map((f) => `/uploads/forms/${f.filename}`);
    const form = await FormRequest.create({
      ...req.body,
      submittedBy: req.user.id,
      attachments: files,
      approvalLog: [
        {
          status: "Submitted",
          updatedBy: req.user.id,
          timestamp: new Date(),
        },
      ],
    });
    res.status(201).json(form);
  } catch (err) {
    console.error("❌ Error submitting form:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

// Get all forms (admin sees all, staff sees their own)
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { submittedBy: req.user.id };
    const forms = await FormRequest.find(filter)
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ message: "Error fetching forms" });
  }
});

// Update form status + log it
router.patch("/:id/status", verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const form = await FormRequest.findById(req.params.id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    form.status = status;
    form.approvalLog.push({
      status,
      updatedBy: req.user.id,
      timestamp: new Date(),
    });

    await form.save();
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// Add a comment (admin only)
router.patch("/:id/comment", verifyToken, isAdmin, async (req, res) => {
  try {
    const { comment } = req.body;
    const updated = await FormRequest.findByIdAndUpdate(
      req.params.id,
      { comment },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Acknowledge policy (digital signature or checkbox)
router.patch("/:id/acknowledge", verifyToken, async (req, res) => {
  try {
    const { acknowledged } = req.body;
    const updated = await FormRequest.findByIdAndUpdate(
      req.params.id,
      { acknowledged },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to acknowledge policy" });
  }
});



// Generate PDF of a specific form
router.get("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const form = await FormRequest.findById(req.params.id).populate("submittedBy", "name email");
    if (!form) return res.status(404).json({ message: "Form not found" });

    const doc = new PDFDocument();
    const filename = `form-${form._id}.pdf`;
    res.setHeader("Content-Disposition", `inline; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(18).text(`Form Request Summary`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Type: ${form.type}`);
    doc.text(`Department: ${form.department}`);
    doc.text(`Submitted By: ${form.submittedBy?.name || "N/A"} (${form.submittedBy?.email || "N/A"})`);
    doc.text(`Submitted At: ${new Date(form.createdAt).toLocaleString()}`);
    doc.text(`Status: ${form.status}`);
    doc.moveDown();

    if (form.fields) {
      doc.fontSize(14).text("Details:");
      Object.entries(form.fields).forEach(([key, value]) => {
        if (value) doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    }

    if (form.comment) {
      doc.text(`Admin Comment: ${form.comment}`, { italic: true });
      doc.moveDown();
    }

    if (form.acknowledged) {
      doc.text("✅ This request includes a policy acknowledgment.");
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});


export default router;
