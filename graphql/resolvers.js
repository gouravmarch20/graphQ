import { Service, pubsub, TASK_UPDATED, COMMENT_ADDED } from "../services.js";

export const resolvers = {
  Query: {
    projects: () => Service.getProjects(),
    project: (_, { id }) => Service.getProjectById(id),
    tasks: (_, { projectId }) => Service.getTasksByProject(projectId),
    task: (_, { id }) => Service.getTaskById(id),
  },

  ProjectMember: {
    user: (parent) => Service.getUserById(parent.userId),
  },

  Task: {
    subtasks: (parent) => Service.getSubtasksByTask(parent._id),
    comments: (parent) => Service.getCommentsByTask(parent._id),
    'assignee': (parent) => Service.getUserById(parent.assignee), // <-- add this
  },

  Comment: {
    user: (parent) => Service.getUserById(parent.userId),
    parentComment: (parent) => Service.getParentComment(parent.parentCommentId),
    replies: (parent) => Service.getReplies(parent._id),
    likes: (parent) => Service.getUsersByIds(parent.likes),
  },

  Mutation: {
    createProject: (_, args) => Service.createProject(args),
    createTask: (_, args) => Service.createTask(args),
    createSubtask: (_, args) => Service.createSubtask(args),
    addComment: (_, args) => Service.addComment(args),
    updateTaskStatus: (_, { taskId, status }) =>
      Service.updateTaskStatus(taskId, status),
  },

  Subscription: {
    taskUpdated: {
      subscribe: (_, { projectId }) => pubsub.asyncIterator(TASK_UPDATED),
      resolve: (payload, args) =>
        payload.projectId.toString() === args.projectId
          ? payload.taskUpdated
          : null,
    },
    commentAdded: {
      subscribe: (_, { taskId }) => pubsub.asyncIterator(COMMENT_ADDED),
      resolve: (payload, args) =>
        payload.taskId.toString() === args.taskId ? payload.commentAdded : null,
    },
  },
};
