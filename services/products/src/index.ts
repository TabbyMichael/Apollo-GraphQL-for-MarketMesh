import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeResolvers } from '@graphql-tools/merge';
import { Resolvers } from './generated/graphql';
import productResolvers from './resolvers/productResolver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load schema from .graphql file
const typeDefs = readFileSync(
  path.join(__dirname, 'schema.graphql'),
  'utf-8'
);

// Merge all resolvers
const resolvers: Resolvers = mergeResolvers([productResolvers]);

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
  listen: { port: Number(process.env.PORT) || 4001 },
  context: async ({ req }) => {
    // You can add authentication/authorization logic here
    const token = req.headers.authorization || '';
    return { token };
  },
});

console.log(`🚀 Products service ready at ${url}`);
