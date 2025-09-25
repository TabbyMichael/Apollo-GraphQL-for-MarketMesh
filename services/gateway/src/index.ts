import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const serviceList = [
  { name: 'products', url: process.env.PRODUCTS_SERVICE_URL },
  { name: 'users', url: process.env.USERS_SERVICE_URL },
  { name: 'orders', url: process.env.ORDERS_SERVICE_URL },
  { name: 'payments', url: process.env.PAYMENTS_SERVICE_URL },
  { name: 'notifications', url: process.env.NOTIFICATIONS_SERVICE_URL },
  { name: 'uploads', url: process.env.UPLOADS_SERVICE_URL },
  { name: 'analytics', url: process.env.ANALYTICS_SERVICE_URL },
];

// Validate that all service URLs are defined
const missingServices = serviceList.filter(service => !service.url);
if (missingServices.length > 0) {
  const missingServiceNames = missingServices.map(s => s.name.toUpperCase() + '_SERVICE_URL').join(', ');
  throw new Error(`Missing required environment variables: ${missingServiceNames}`);
}

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: serviceList,
    subgraphHealthCheck: true,
  }),
});

const port = parseInt(process.env.GATEWAY_PORT || '4000', 10);

const server = new ApolloServer({
  gateway,
});

async function startGateway() {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });
    console.log(`🚀 Gateway ready at ${url}`);
  } catch (error) {
    console.error('Failed to start Apollo Gateway:', error);
    process.exit(1);
  }
}

startGateway();