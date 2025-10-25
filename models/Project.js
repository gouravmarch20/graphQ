// models/Project.js
import mongoose from "mongoose";

const projectMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String, enum: ["Admin", "Member", "Guest"], default: "Member" },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [projectMemberSchema],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

export default mongoose.model("Project", projectSchema);
