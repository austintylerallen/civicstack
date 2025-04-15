import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const departmentReviewSchema = new mongoose.Schema({
  name: String,
  reviewed: { type: Boolean, default: false }
});

const developmentProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  department: { type: String, required: true },
  status: { type: String, default: "Submitted" },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attachments: [String],
  departments: [departmentReviewSchema],
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("DevelopmentProject", developmentProjectSchema);
