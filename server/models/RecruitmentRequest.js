import mongoose from "mongoose";

const recruitmentRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  justification: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Requested", "Approved", "In Hiring", "Hired", "Rejected"],
    default: "Requested",
  },
  attachments: {
    type: [String], // file paths or URLs
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("RecruitmentRequest", recruitmentRequestSchema);
