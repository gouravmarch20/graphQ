// models/Task.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo",
  },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subtask" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  labels: [String],
});

export default mongoose.model("Task", taskSchema);
