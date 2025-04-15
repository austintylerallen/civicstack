import mongoose from "mongoose";
import dotenv from "dotenv";
import Issue from "../models/Issue.js";
import User from "../models/User.js";

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🧠 Connected to MongoDB");

    await Issue.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    });

    const issues = await Issue.insertMany([
      {
        title: "Broken sidewalk",
        description: "Large crack near 5th and Main.",
        department: "Public Works",
        priority: "High",
        status: "New",
        createdBy: admin._id,
        comments: [
          {
            text: "Noted. Will investigate this week.",
            author: admin._id,
          },
        ],
      },
      {
        title: "Overflowing trash can",
        description: "Trash piling up outside city library.",
        department: "Sanitation",
        priority: "Medium",
        status: "In Progress",
        createdBy: admin._id,
      },
    ]);

    console.log(`✅ Seeded ${issues.length} issues and 1 admin user`);
    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

runSeed();
