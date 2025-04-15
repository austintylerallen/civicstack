import express from "express";
import multer from "multer";
import DevelopmentProject from "../models/DevelopmentProject.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// 📁 Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// 🚀 POST /api/development-projects — Submit new project
// developmentRoutes.js
router.post("/", verifyToken, upload.array("attachments"), async (req, res) => {
    try {
      const { name, description, department, status } = req.body;
      const fileUrls = req.files?.map((file) => `/uploads/${file.filename}`) || [];
  
      if (!name || !req.user.id) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const newProject = await DevelopmentProject.create({
        name,
        description,
        department,
        status: status || "Submitted",
        applicant: req.user.id, // ✅ now added
        attachments: fileUrls,
        departments: [
          { name: "Planning" },
          { name: "Building" },
          { name: "Fire" },
          { name: "Utilities" },
        ],
      });
  
      res.status(201).json(newProject);
    } catch (err) {
      console.error("❌ Error submitting project:", err);
      res.status(500).json({ message: "Submission failed" });
    }
  });
  
  

// 📄 GET /api/development-projects — All projects (admin or user's own)
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { applicant: req.user.id };

    const projects = await DevelopmentProject.find(filter)
      .populate("applicant", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("❌ Failed to load projects:", err);
    res.status(500).json({ message: "Failed to load projects" });
  }
});


// 📝 Add comment to a project
router.post("/:id/comments", verifyToken, async (req, res) => {
    try {
      const { content } = req.body;
      const project = await DevelopmentProject.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
  
      project.comments.push({
        author: req.user.id,
        content,
      });
  
      await project.save();
      const populated = await project.populate("comments.author", "name");
      res.status(201).json(populated.comments);
    } catch (err) {
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // ❌ Delete comment (admin only)
  router.delete("/:projectId/comments/:commentId", verifyToken, isAdmin, async (req, res) => {
    try {
      const project = await DevelopmentProject.findById(req.params.projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });
  
      project.comments = project.comments.filter(
        (comment) => comment._id.toString() !== req.params.commentId
      );
  
      await project.save();
      res.json({ message: "Comment deleted" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  

// ❌ DELETE a project (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
      await DevelopmentProject.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error deleting project:", err);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });


  // ✅ PATCH department review toggle
router.patch("/:id/department-check", verifyToken, async (req, res) => {
    try {
      const { department, reviewed } = req.body;
      const project = await DevelopmentProject.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
  
      const dept = project.departments.find((d) => d.name === department);
      if (dept) {
        dept.reviewed = reviewed;
        await project.save();
      }
  
      res.json(project);
    } catch (err) {
      console.error("❌ Failed to update department check:", err);
      res.status(500).json({ message: "Update failed" });
    }
  });
  
  

export default router;
