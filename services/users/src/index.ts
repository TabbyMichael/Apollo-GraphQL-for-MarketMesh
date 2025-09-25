import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from './generated/graphql';
import userResolvers from './resolvers/userResolver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema from .graphql file
const typeDefs = readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf-8'
);

// Merge all resolvers
const resolvers: Resolvers = mergeResolvers([userResolvers]);

// Create Apollo Server with Federation support
const server = new ApolloServer({
  schema: buildSubgraphSchema({
    typeDefs,
    resolvers: resolvers as any, // Type assertion needed due to type mismatch
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

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) || 4002 },
  context: async ({ req }) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    
    try {
      if (token) {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string; role: string };
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
