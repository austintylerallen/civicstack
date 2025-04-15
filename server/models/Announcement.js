import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    attachment: { type: String }, // ✅ add this
  }, { timestamps: true });
  

export default mongoose.model("Announcement", announcementSchema);
