import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { verifyToken } from './middleware/auth.js';

// Routes
import issueRoutes from './routes/issueRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import workOrderRoutes from './routes/workOrderRoutes.js';
import formRoutes from './routes/formRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import developmentRoutes from './routes/developmentRoutes.js';
import feedbackRoutes from "./routes/feedbackRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";








dotenv.config();
console.log("✅ EMAIL_USER:", process.env.EMAIL_USER);
console.log("✅ EMAIL_PASS:", !!process.env.EMAIL_PASS);

const app = express();

// Handle ES module path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 🔒 Enable CORS for local frontend
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 📁 Serve static files from /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/resumes", express.static("uploads/resumes"));

// 🧠 Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// 🚏 Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", verifyToken, issueRoutes);
app.use("/api/admin", verifyToken, adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/form-requests", verifyToken, formRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/development-projects", developmentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);

// 🛠️ DB and Server
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5173;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
