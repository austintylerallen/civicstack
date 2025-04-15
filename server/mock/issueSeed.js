import mongoose from "mongoose";
import dotenv from "dotenv";

import Issue from "../models/Issue.js";
import WorkOrder from "../models/WorkOrder.js";
import FormRequest from "../models/FormRequest.js";
import Announcement from "../models/Announcement.js";
import DevelopmentProject from "../models/DevelopmentProject.js";

dotenv.config();

const fakeUserId = new mongoose.Types.ObjectId(); // 👈 Used for required user references

const issues = [
  {
    title: "Pothole on Main Street",
    description: "Large pothole near city hall.",
    department: "Roads",
    priority: "High",
    status: "New",
    submittedBy: fakeUserId
  },
  {
    title: "Graffiti cleanup",
    description: "Graffiti on park wall.",
    department: "Parks",
    priority: "Low",
    status: "In Progress",
    submittedBy: fakeUserId
  },
];

const workOrders = [
  {
    title: "Repair HVAC Unit",
    description: "Main building A/C not cooling.",
    department: "Facilities",
    priority: "High",
    status: "New",
    requestedBy: fakeUserId
  },
  {
    title: "Fix Sprinkler",
    description: "Sprinkler leaking in zone 3.",
    department: "Parks and Rec",
    priority: "Medium",
    status: "In Progress",
    requestedBy: fakeUserId
  },
];

const formRequests = [
  {
    type: "Leave Request",
    department: "HR",
    status: "Pending",
    acknowledged: true,
    submittedBy: fakeUserId,
    fields: {
      startDate: "2025-04-20",
      endDate: "2025-04-25",
      description: "Family vacation"
    }
  },
  {
    type: "Expense Report",
    department: "Finance",
    status: "Approved",
    acknowledged: false,
    submittedBy: fakeUserId,
    fields: {
      amount: "245.00",
      description: "Conference hotel"
    }
  },
];

const announcements = [
    {
      title: "City Hall Closed Friday",
      content: "Due to maintenance, city hall will close this Friday.",
      department: "General Services",
      pinned: true,
      author: fakeUserId, // ✅ correct field
    },
    {
      title: "New Time Reporting System",
      content: "Training starts next Monday.",
      department: "HR",
      pinned: false,
      author: fakeUserId, // ✅ correct field
    },
  ];
  

  const developmentProjects = [
    {
      name: "Downtown Parking Garage",
      description: "New parking structure at 6th and Main",
      department: "Community Development",
      status: "Planning",
      applicant: fakeUserId, // ✅ required field
    },
    {
      name: "Greenway Trail Expansion",
      description: "Extend trail north of the Rio Grande",
      department: "Parks and Rec",
      status: "Submitted",
      applicant: fakeUserId, // ✅ required field
    },
  ];
  
  

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Issue.deleteMany();
    await Issue.insertMany(issues);
    console.log("✅ Seeded issues");

    await WorkOrder.deleteMany(); 
    await WorkOrder.insertMany(workOrders);
    console.log("✅ Seeded work orders");

    await FormRequest.deleteMany();
    await FormRequest.insertMany(formRequests);
    console.log("✅ Seeded form requests");

    await Announcement.deleteMany();
    await Announcement.insertMany(announcements);
    console.log("✅ Seeded announcements");

    await DevelopmentProject.deleteMany();
    await DevelopmentProject.insertMany(developmentProjects);
    console.log("✅ Seeded development projects");

    process.exit();
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();
