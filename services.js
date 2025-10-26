import { PubSub } from "graphql-subscriptions";
import User from "./models/User.js";
import Project from "./models/Project.js";
import Task from "./models/Task.js";
import Subtask from "./models/Subtask.js";
import Comment from "./models/Comment.js";

export const pubsub = new PubSub();
export const TASK_UPDATED = "TASK_UPDATED";
export const COMMENT_ADDED = "COMMENT_ADDED";

export const Service = {
  // Projects
  getProjects: async () => await Project.find({}).populate("members.userId").populate("tasks"),
  getProjectById: async (id) => await Project.findById(id).populate("members.userId").populate("tasks"),
  createProject: async ({ name, description, members }) => {
    const project = new Project({ name, description, members });
    await project.save();
    return project.populate("members.userId");
  },

  // Tasks
  getTasksByProject: async (projectId) =>
    await Task.find({ projectId }).populate("assignee").populate("subtasks").populate("comments"),
  getTaskById: async (id) =>
    await Task.findById(id).populate("assignee").populate("subtasks").populate("comments"),
  createTask: async ({ projectId, title, description, assigneeId, labels }) => {
    const task = new Task({ projectId, title, description, assignee: assigneeId, labels });
    await task.save();
    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
    pubsub.publish(TASK_UPDATED, { taskUpdated: task, projectId });
    return task;
  },
  updateTaskStatus: async (taskId, status) => {
    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
    pubsub.publish(TASK_UPDATED, { taskUpdated: task, projectId: task.projectId });
    return task;
  },

  // Subtasks
  createSubtask: async ({ taskId, title, assigneeId }) => {
    const subtask = new Subtask({ taskId, title, assignee: assigneeId });
    await subtask.save();
    await Task.findByIdAndUpdate(taskId, { $push: { subtasks: subtask._id } });
    return subtask;
  },
  getSubtasksByTask: async (taskId) => await Subtask.find({ taskId }).populate("assignee"),

  // Comments
  addComment: async ({ taskId, userId, content, parentCommentId }) => {
    const comment = new Comment({ taskId, userId, content, parentCommentId });
    await comment.save();
    await Task.findByIdAndUpdate(taskId, { $push: { comments: comment._id } });
    pubsub.publish(COMMENT_ADDED, { commentAdded: comment, taskId });
    return comment;
  },
  getCommentsByTask: async (taskId) =>
    await Comment.find({ taskId, parentCommentId: null }).populate("userId"),
  getReplies: async (parentId) => await Comment.find({ parentCommentId: parentId }).populate("userId"),
  getParentComment: async (parentId) => (parentId ? await Comment.findById(parentId) : null),

  // Users
  getUserById: async (id) => await User.findById(id),
  getUsersByIds: async (ids) => await User.find({ _id: { $in: ids } }),
};
