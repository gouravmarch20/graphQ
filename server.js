import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { connectDB } from './db.js';
import typeDefs from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';

const startServer = async () => {
  await connectDB(); // Connect to MongoDB

  const app = express();
  const httpServer = http.createServer(app);

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  // Additional middleware
  app.use(helmet());
  app.use(morgan('dev'));

  // Start the server
  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}/graphql`)
  );
};

startServer();
