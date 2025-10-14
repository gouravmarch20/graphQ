// server.ts
import express, { Request, Response, NextFunction } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;
const ENV = process.env.NODE_ENV || "development";

// 1️⃣ Define GraphQL schema
const typeDefs = `
  type Query {
    hello: String
  }

  type Mutation {
    greet(name: String!): String
  }
`;

// 2️⃣ Define resolvers
const resolvers = {
  Query: {
    hello: () => "Hello GraphQL!",
  },
  Mutation: {
    greet: (_: any, args: { name: string }) => `Hello, ${args.name}!`,
  },
};

// 3️⃣ Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

// 4️⃣ Create Express app
const app = express();

// 5️⃣ Middlewares
app.use(
  helmet({
    contentSecurityPolicy: ENV !== "development",
    crossOriginEmbedderPolicy: ENV !== "development",
  })
);
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// 6️⃣ GraphQL endpoint
app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.authorization }),
  })
);

// 7️⃣ Test route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + Apollo Server!");
});

// 8️⃣ Error handling
app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
);

// 9️⃣ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
});
