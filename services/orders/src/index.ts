import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const typeDefs = gql(readFileSync('./src/schema.graphql', { encoding: 'utf-8' }));

const orders = [
    { id: '1', userId: '1', productIds: ['1', '2'], total: 1275 },
];

const resolvers = {
  Query: {
    orders: () => orders,
  },
  Order: {
    user(order: { userId: string; }) {
      return { __typename: "User", id: order.userId };
    },
    products(order: { productIds: string[]; }) {
      return order.productIds.map(id => ({ __typename: "Product", id }));
    }
  }
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

const port = parseInt(process.env.ORDERS_SERVICE_PORT || '4003', 10);

async function startOrdersService() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });
    console.log(`🚀 Orders service ready at ${url}`);
  } catch (error) {
    console.error('Failed to start Orders service:', error);
    process.exit(1);
  }
}

startOrdersService();