"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const gateway_1 = require("@apollo/gateway");
const standalone_1 = require("@apollo/server/standalone");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../../.env');
console.log(`Loading environment variables from: ${envPath}`);
dotenv.config({ path: envPath });
// Define service URLs with fallbacks
const services = [
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
    console.log('Starting Apollo Gateway...');
    console.log('Environment variables:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- PORT: ${process.env.PORT}`);
    services.forEach(({ name, url }) => {
        console.log(`- ${name.toUpperCase()}_SERVICE_URL: ${url}`);
    });
    const gateway = new gateway_1.ApolloGateway({
        supergraphSdl: new gateway_1.IntrospectAndCompose({
            subgraphs: services,
            subgraphHealthCheck: true,
        }),
    });
    const server = new server_1.ApolloServer({
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
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
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
    }
    catch (error) {
        console.error('Fatal error during server startup:', error);
        process.exit(1);
    }
}
// Execute the main function
main().catch(error => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map