import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';  // Import path module
import db from './config/connection.js';

import { typeDefs } from './schemas/typeDefs.js';
import { resolvers } from './schemas/resolvers.js';
import { authMiddleware } from './services/auth.js';

console.log("🟡 Attempting to connect to MongoDB...");

const app = express();
const PORT = process.env.PORT || 3001;
const { json } = bodyParser;

// Add Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the "client/dist" folder
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../client/dist')));

// Add a Root Route for API
app.get('/api', (_req, res) => {
  res.send('📚 Book Search Engine API is running! Access GraphQL at `/graphql`.');
});

// Serve React App for All Other Routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Create Apollo Server
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

  // Start Server
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

