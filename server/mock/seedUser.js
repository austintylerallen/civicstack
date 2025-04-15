import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createStaffUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await User.findOne({ email: "staff@example.com" });
    if (existing) {
      console.log("⚠️ Staff user already exists.");
    } else {
      const user = new User({
        name: "Demo Staff",
        email: "staff@example.com",
        password: "password123",
        role: "staff"
      });

      await user.save();
      console.log("✅ Staff user created!");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating staff user:", err);
    process.exit(1);
  }
};

createStaffUser();
