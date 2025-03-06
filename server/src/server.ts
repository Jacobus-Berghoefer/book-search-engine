import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './config/connection.js';

import { typeDefs } from './schemas/typeDefs.js';
import { resolvers } from './schemas/resolvers.js';
import { authMiddleware } from './services/auth.js';

console.log("🟡 Attempting to connect to MongoDB...");

const app = express();
const PORT = process.env.PORT || 3001;
const { json } = bodyParser;

// Add Express Middleware Before Apollo
app.use(cors());
app.use(express.json()); // Allow JSON requests

app.get('/', (_req, res) => {
  res.send('📚 Book Search Engine API is running! Access GraphQL at `/graphql`.');
});

// Create an instance of Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error("GraphQL Error:", err);
    return err;
  },
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => await authMiddleware({ req }),
    })
  );

  console.log("🟡 Express setup complete, waiting for MongoDB...");

  // ✅ Ensure Server Starts Even if MongoDB Takes Time
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
    console.log("📡 Waiting for API requests...");
  });

  db.on('error', (err) => {
    console.error("❌ Database connection error:", err);
  });

  db.once('open', () => {
    console.log("✅ Database connected successfully!");
  });
}

startServer();
