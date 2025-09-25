import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import { productResolver } from './resolvers/productResolver.js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const typeDefs = gql(readFileSync('./src/schema.graphql', { encoding: 'utf-8' }));

const schema = buildSubgraphSchema({ typeDefs, resolvers: productResolver });

const server = new ApolloServer({
  schema,
});

const port = parseInt(process.env.PRODUCTS_SERVICE_PORT || '4001', 10);

async function startProductService() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });
    console.log(`🚀 Products service ready at ${url}`);
  } catch (error) {
    console.error('Failed to start Products service:', error);
    process.exit(1);
  }
}

startProductService();