import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

type Service = {
  name: string;
  url: string;
};

// Define service URLs with fallbacks
const services: Service[] = [
  {
    name: 'products',
    url: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:4002'
  },
  {
    name: 'users',
    url: process.env.USERS_SERVICE_URL || 'http://localhost:4001'
  },
  {
    name: 'orders',
    url: process.env.ORDERS_SERVICE_URL || 'http://localhost:4003'
  },
];

console.log('Configured services:');
services.forEach(service => {
  console.log(`- ${service.name}: ${service.url}`);
});

async function startServer() {
  console.log('[1] Starting Apollo Gateway...');
  console.log('[2] Environment variables:');
  console.log(`[3] - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[4] - PORT: ${process.env.PORT || '4000 (default)'}`);

  // Log all environment variables for debugging
  console.log('[5] All environment variables:');
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.includes('SERVICE_URL') || key === 'NODE_ENV' || key === 'PORT') {
      console.log(`[5] ${key}=${value}`);
    }
  });

  console.log('[6] Services configuration:');
  services.forEach(({ name, url }, index) => {
    console.log(`[6.${index + 1}] ${name.toUpperCase()}_SERVICE_URL: ${url}`);
  });

  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: services,
      subgraphHealthCheck: true,
    }),
  });

  const server = new ApolloServer({
    gateway,
    // Enable schema polling for development
    logger: console,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            console.log('Server is stopping...');
          }
        };
      }
    }]
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4000 },
  });

  console.log(`🚀 Gateway ready at ${url}`);
  console.log('Available services:');
  services.forEach(({ name, url }) => {
    console.log(`- ${name}: ${url}`);
  });
}

// Start the server with error handling
async function main() {
  try {
    console.log('Starting server...');
    await startServer();
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Unhandled error in main:', error);
  process.exit(1);
});
