import mongoose from "mongoose";

const workOrderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  department: { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["New", "In Progress", "Completed", "Cancelled"],
    default: "New",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

workOrderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("WorkOrder", workOrderSchema);
