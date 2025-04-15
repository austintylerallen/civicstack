import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String },
  location: { type: String },
  status: { type: String, default: "Open" }, // Open / Closed
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("JobPost", jobPostSchema);
