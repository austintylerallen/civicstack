import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "../models/Issue.js";

dotenv.config();

const mockIssues = [
  {
    title: "Pothole on Main Street",
    description: "Large pothole near city hall, causing traffic issues.",
    department: "Roads",
    priority: "High",
    status: "New"
  },
  {
    title: "Graffiti on public park wall",
    description: "Needs removal by maintenance staff.",
    department: "Parks",
    priority: "Low",
    status: "In Progress"
  },
  {
    title: "Streetlight out",
    description: "Intersection at 3rd and Elm is dark.",
    department: "Public Works",
    priority: "Medium",
    status: "Resolved"
  },
  {
    title: "Water leak reported",
    description: "Resident reports water pooling in backyard from city pipe.",
    department: "Utilities",
    priority: "High",
    status: "New"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Issue.deleteMany();
    await Issue.insertMany(mockIssues);
    console.log("✅ Mock issues inserted.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed();
