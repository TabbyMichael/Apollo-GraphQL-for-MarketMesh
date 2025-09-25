import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { mergeResolvers } from '@graphql-tools/merge';
import jwt from 'jsonwebtoken';

import { Resolvers } from './generated/graphql';
import userResolvers from './resolvers/userResolver';

// Load schema from .graphql file
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

// Merge all resolvers
const resolvers: Resolvers = mergeResolvers([userResolvers]);

// Create Apollo Server with Federation support
const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers,
  }),
  plugins: [
    // Basic logging
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext) {
            const { operationName, query, variables } = requestContext.request;
            console.log('GraphQL Request:', {
              operationName,
              query: query?.replace(/\s+/g, ' ').trim(),
              variables,
            });
          },
          async didEncounterErrors(requestContext) {
            console.error('GraphQL Errors:', requestContext.errors);
          },
        };
      },
    },
  ],
});

// Function to start the server
async function startServer() {
  // Start the server
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4002 },
    context: async ({ req }) => {
      // Extract token from Authorization header
      const token = req.headers.authorization?.replace('Bearer ', '') || '';

      try {
        if (token) {
          // Verify and decode the token
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
          };
          return {
            userId: decoded.userId,
            role: decoded.role,
            token,
          };
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }

      return { token };
    },
  });

  console.log(`🚀 Users service ready at ${url}`);
}

// Start the server
startServer();