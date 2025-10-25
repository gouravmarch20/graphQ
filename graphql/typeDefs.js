// graphql/typeDefs.js
import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    projects: [Project!]
  }

  type ProjectMember {
    user: User!
    role: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    members: [ProjectMember!]!
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    assignee: User
    subtasks: [Subtask!]!
    comments: [Comment!]!
    labels: [String!]
  }

  type Subtask {
    id: ID!
    title: String!
    status: String!
    assignee: User
  }

  type Comment {
    id: ID!
    user: User!
    content: String!
    parentComment: Comment
    likes: [User!]!
    replies: [Comment!]!
  }

  input ProjectMemberInput {
    userId: ID!
    role: String!
  }

  type Query {
    projects: [Project!]!
    project(id: ID!): Project
    tasks(projectId: ID!): [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createProject(name: String!, description: String, members: [ProjectMemberInput!]!): Project!
    createTask(projectId: ID!, title: String!, description: String, assigneeId: ID, labels: [String!]): Task!
    createSubtask(taskId: ID!, title: String!, assigneeId: ID): Subtask!
    addComment(taskId: ID!, userId: ID!, content: String!, parentCommentId: ID): Comment!
    updateTaskStatus(taskId: ID!, status: String!): Task!
  }

  type Subscription {
    taskUpdated(projectId: ID!): Task!
    commentAdded(taskId: ID!): Comment!
  }
`;

export default typeDefs; // ✅ default export
