import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { mergeResolvers } from '@graphql-tools/merge';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

import { Resolvers } from './generated/graphql';
import userResolvers from './resolvers/userResolver';
import { UserService } from './userService';
import { Context } from './context';

// Load schema from .graphql file
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8');

// Merge all resolvers
const resolvers: Resolvers = mergeResolvers([userResolvers]);

// Instantiate dependencies
const prisma = new PrismaClient();
const userService = new UserService(prisma);

// Create Apollo Server with Federation support
const server = new ApolloServer<Context>({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers,
  }),
});

// Function to start the server
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4002 },
    context: async ({ req }): Promise<Context> => {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      let userId: string | undefined;
      let role: string | undefined;

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
          };
          userId = decoded.userId;
          role = decoded.role;
        } catch (error) {
          console.error('Error verifying token:', error);
        }
      }

      return {
        token,
        userId,
        role,
        prisma,
        userService,
      };
    },
  });

  console.log(`🚀 Users service ready at ${url}`);
}

// Start the server
startServer();