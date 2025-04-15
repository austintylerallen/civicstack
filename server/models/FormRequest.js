import mongoose from "mongoose";

const formRequestSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true,
      enum: ["Leave Request", "Expense Report", "Timesheet", "Other", "Policy Acknowledgment"],
    },
    department: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    fields: { type: Object, required: true },
    attachments: [String],
    comment: String,
    approvalLog: [
      {
        status: String,
        comment: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: Date,
      },
    ],
  }, { timestamps: true });
  

export default mongoose.model("FormRequest", formRequestSchema);
