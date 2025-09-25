import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const typeDefs = gql(readFileSync('./src/schema.graphql', { encoding: 'utf-8' }));

const resolvers = {
  Query: {
    me: () => ({ id: '1', email: 'user@example.com', role: 'USER' }),
  },
  User: {
    __resolveReference(user: { id: string; }) {
        return { id: user.id, email: `user+${user.id}@example.com`, role: 'USER' };
    }
  }
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

const port = parseInt(process.env.USERS_SERVICE_PORT || '4002', 10);

async function startUsersService() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });
    console.log(`🚀 Users service ready at ${url}`);
  } catch (error) {
    console.error('Failed to start Users service:', error);
    process.exit(1);
  }
}

startUsersService();