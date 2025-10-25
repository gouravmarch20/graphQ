import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";

// 1️⃣ Define GraphQL schema
const typeDefs = `
  type Query {
    hello: String
    add(a: Int!, b: Int!): Int
  }
`;

// 2️⃣ Define resolvers
const resolvers = {
  Query: {
    hello: () => "Hello World!",
    add: (_, { a, b }) => a + b,
  },
};

// 3️⃣ Create Apollo server
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
app.use(cors());

// 4️⃣ Start server
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
  );
}

startServer();
