// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Subtask from "./models/Subtask.js";
import Comment from "./models/Comment.js";
import { connectDB } from "./db.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    // --- Clean existing data ---
    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Subtask.deleteMany(),
      Comment.deleteMany(),
    ]);
    console.log("🧹 Cleared existing collections");

    // --- 1️⃣ Create Users ---
    const users = await User.insertMany([
      { name: "Gourav Kumar", email: "gourav@example.com" },
      { name: "Anita Sharma", email: "anita@example.com" },
      { name: "Rohan Patel", email: "rohan@example.com" },
    ]);
    console.log("👤 Users created");

    // --- 2️⃣ Create Project ---
    const project = await Project.create({
      name: "Frontend Migration",
      description: "Moving dashboard to React + GraphQL",
      members: [
        { userId: users[0]._id, role: "Manager" },
        { userId: users[1]._id, role: "Developer" },
        { userId: users[2]._id, role: "Designer" },
      ],
      tasks: [],
    });
    console.log("📁 Project created");

    // --- 3️⃣ Create Tasks ---
    const tasks = await Task.insertMany([
      {
        projectId: project._id,
        title: "Setup GraphQL Server",
        description: "Build Apollo Server with resolvers and typeDefs",
        status: "in_progress",
        assignee: users[1]._id,
        labels: ["backend", "graphql"],
      },
      {
        projectId: project._id,
        title: "Design Dashboard UI",
        description: "Create Figma wireframes for the dashboard",
        status: "todo",
        assignee: users[2]._id,
        labels: ["design", "ui"],
      },
    ]);
    console.log("✅ Tasks created");

    // Link tasks to project
    project.tasks = tasks.map((t) => t._id);
    project.tasks = tasks.map((t) => t._id);

    await project.save();

    // --- 4️⃣ Create Subtasks ---
    const subtask = await Subtask.create({
      taskId: tasks[0]._id,
      title: "Setup Apollo Server",
      status: "done",
      assignee: users[1]._id,
    });
    console.log("🧩 Subtask created");

    await Task.findByIdAndUpdate(tasks[0]._id, {
      $push: { subtasks: subtask._id },
    });

    // --- 5️⃣ Create Comments ---
    const comment = await Comment.create({
      taskId: tasks[0]._id,
      userId: users[0]._id,
      content: "Let's finalize the GraphQL schema by today.",
    });

    await Task.findByIdAndUpdate(tasks[0]._id, {
      $push: { comments: comment._id },
    });
    console.log("💬 Comment created");

    console.log("\n🌱 Seed data generated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
