// backend/models/LeaveRequest.js
import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String, // auto-filled from AuthContext
  department: String,
  leaveType: {
    type: String,
    enum: ["Vacation", "Sick", "Personal", "Other"],
  },
  startDate: Date,
  endDate: Date,
  reason: String,
  attachments: [String], // file paths
  status: {
    type: String,
    enum: ["Submitted", "Approved", "Denied"],
    default: "Submitted",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("LeaveRequest", leaveRequestSchema);
