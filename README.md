# MarketMesh - E-commerce Platform with Apollo GraphQL

A modern e-commerce platform built with a microservices architecture using Apollo GraphQL Federation, TypeScript, and Next.js.

## 🚀 Features

- **Federated GraphQL API** - Multiple microservices composed into a single GraphQL API
- **Type-Safe** - Full TypeScript support throughout the stack
- **Modern Frontend** - Next.js with Apollo Client and Material-UI
- **Scalable** - Independently deployable microservices
- **Developer Experience** - Code generation, hot reloading, and more

## 🏗️ Project Structure

```
.
├── apps/
│   └── web/                    # Next.js frontend application
├── packages/
│   └── graphql/                # Shared GraphQL types and fragments
└── services/
    ├── gateway/               # Apollo Gateway (API Gateway)
    ├── products/              # Products microservice
    ├── users/                 # Users & Authentication microservice
    ├── orders/                # Orders microservice
    ├── payments/              # Payments microservice
    ├── notifications/         # Notifications microservice
    ├── uploads/               # File uploads microservice
    └── analytics/             # Analytics microservice
```

## 🛠️ Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL (or Docker for running PostgreSQL)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Apollo-GraphQL-for-MarketMesh.git
   cd Apollo-GraphQL-for-MarketMesh
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. **Start the development servers**

   In separate terminal windows, run:
   ```bash
   # Start the gateway
   pnpm --filter @marketmesh/gateway dev

   # Start the products service
   pnpm --filter @marketmesh/products dev

   # Start the users service
   pnpm --filter @marketmesh/users dev

   # Start the orders service
   pnpm --filter @marketmesh/orders dev

   # Start the Next.js frontend
   pnpm --filter @marketmesh/web dev
   ```

5. **Open the application**
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql

## Example GraphQL Operations

### Query: Get All Products

```graphql
query GetProducts {
  products {
    id
    name
    price
    seller {
      id
      name
    }
  }
}
```

### Mutation: Create an Order (Example)

```graphql
mutation CreateOrder($userId: ID!, $productIds: [ID!]!, $total: Float!) {
  createOrder(userId: $userId, productIds: $productIds, total: $total) {
    id
    user {
      id
      email
    }
    products {
      id
      name
    }
    total
  }
}
```

## 📚 Services Documentation

### Products Service
- **Port**: 4001
- **GraphQL Endpoint**: http://localhost:4001/graphql
- **Description**: Manages products, categories, and inventory.

### Users Service
- **Port**: 4002
- **GraphQL Endpoint**: http://localhost:4002/graphql
- **Description**: Handles user authentication, profiles, and permissions.

### Orders Service
- **Port**: 4003
- **GraphQL Endpoint**: http://localhost:4003/graphql
- **Description**: Manages orders, order items, and order history.

## 🧪 Testing

Run tests for all services:
```bash
pnpm test
```

Run tests for a specific service:
```bash
pnpm --filter @marketmesh/products test
```

## 🏗️ Deployment

### Prerequisites
- Docker and Docker Compose
- Kubernetes (for production)
- CI/CD pipeline (GitHub Actions, GitLab CI, etc.)

### Production Build

1. Build all services:
   ```bash
   pnpm build
   ```

2. Start the services with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct.

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/your-username/Apollo-GraphQL-for-MarketMesh](https://github.com/your-username/Apollo-GraphQL-for-MarketMesh)

## 🙏 Acknowledgments

- [Apollo GraphQL](https://www.apollographql.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Material-UI](https://mui.com/)
- And all the amazing open-source libraries we depend on!
