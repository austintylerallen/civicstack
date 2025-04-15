import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
  },
  resumeUrl: String,
  status: {
    type: String,
    enum: ["Submitted", "Reviewed", "Interviewing", "Hired", "Rejected"],
    default: "Submitted",
  },
  answers: {
    whyInterested: String,
    experience: String,
  },
}, { timestamps: true });

export default mongoose.model("Application", applicationSchema);
