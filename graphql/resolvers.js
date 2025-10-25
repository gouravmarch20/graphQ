import { PubSub } from "graphql-subscriptions";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Subtask from "../models/Subtask.js";
import Comment from "../models/Comment.js";

const pubsub = new PubSub();
const TASK_UPDATED = "TASK_UPDATED";
const COMMENT_ADDED = "COMMENT_ADDED";

export const resolvers = {
  Query: {
    projects: async () =>
      await Project.find({}).populate("members.userId").populate("tasks"),
    project: async (_, { id }) =>
      await Project.findById(id).populate("members.userId").populate("tasks"),
    tasks: async (_, { projectId }) =>
      await Task.find({ projectId })
        .populate("assignee")
        .populate("subtasks")
        .populate("comments"),
    task: async (_, { id }) =>
      await Task.findById(id)
        .populate("assignee")
        .populate("subtasks")
        .populate("comments"),
  },

  ProjectMember: {
    user: async (parent) => await User.findById(parent.userId),
  },

  Task: {
    subtasks: async (parent) =>
      await Subtask.find({ taskId: parent._id }).populate("assignee"),
    comments: async (parent) =>
      await Comment.find({
        taskId: parent._id,
        parentCommentId: null,
      }).populate("userId"),
  },

  Comment: {
    user: async (parent) => await User.findById(parent.userId),
    parentComment: async (parent) =>
      parent.parentCommentId
        ? await Comment.findById(parent.parentCommentId)
        : null,
    replies: async (parent) =>
      await Comment.find({ parentCommentId: parent._id }).populate("userId"),
    likes: async (parent) => await User.find({ _id: { $in: parent.likes } }),
  },

  Mutation: {
    createProject: async (_, { name, description, members }) => {
      const project = new Project({ name, description, members });
      await project.save();
      return project.populate("members.userId");
    },
    createTask: async (_, { projectId, title, description, assigneeId, labels }) => {
      const task = new Task({ projectId, title, description, assignee: assigneeId, labels });
      await task.save();
      await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });
      pubsub.publish(TASK_UPDATED, { taskUpdated: task, projectId });
      return task;
    },
    createSubtask: async (_, { taskId, title, assigneeId }) => {
      const subtask = new Subtask({ taskId, title, assignee: assigneeId });
      await subtask.save();
      await Task.findByIdAndUpdate(taskId, { $push: { subtasks: subtask._id } });
      return subtask;
    },
    addComment: async (_, { taskId, userId, content, parentCommentId }) => {
      const comment = new Comment({ taskId, userId, content, parentCommentId });
      await comment.save();
      await Task.findByIdAndUpdate(taskId, { $push: { comments: comment._id } });
      pubsub.publish(COMMENT_ADDED, { commentAdded: comment, taskId });
      return comment;
    },
    updateTaskStatus: async (_, { taskId, status }) => {
      const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
      pubsub.publish(TASK_UPDATED, { taskUpdated: task, projectId: task.projectId });
      return task;
    },
  },

  Subscription: {
    taskUpdated: {
      subscribe: (_, { projectId }) => pubsub.asyncIterator(TASK_UPDATED),
      resolve: (payload, args) =>
        payload.projectId.toString() === args.projectId ? payload.taskUpdated : null,
    },
    commentAdded: {
      subscribe: (_, { taskId }) => pubsub.asyncIterator(COMMENT_ADDED),
      resolve: (payload, args) =>
        payload.taskId.toString() === args.taskId ? payload.commentAdded : null,
    },
  },
};
