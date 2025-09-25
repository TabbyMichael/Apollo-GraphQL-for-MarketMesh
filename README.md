# MarketMesh - Federated GraphQL E-commerce Platform

![Architecture Diagram](https://i.imgur.com/your-architecture-diagram.png)  <!-- You would replace this with an actual diagram -->

**MarketMesh** is a modern, scalable e-commerce platform built on a federated GraphQL API. It leverages a microservices architecture to create a flexible and maintainable system, with a Next.js frontend for a seamless user experience.

## 🚀 Key Features

- **Federated GraphQL API**: A single, unified data graph powered by multiple independent microservices using Apollo Federation.
- **Microservices Architecture**: Each core domain (users, products, orders) is a separate, independently deployable service.
- **Type-Safe**: End-to-end type safety with TypeScript, Prisma, and GraphQL Code Generator.
- **Modern Tech Stack**: Built with Node.js, TypeScript, Apollo, Prisma, Next.js, and Material-UI.
- **Scalable by Design**: The architecture is designed to scale individual services based on demand.

## 🏗️ Architecture Overview

The platform is a pnpm monorepo consisting of several packages:

-   **`apps/web`**: The Next.js frontend application that consumes the GraphQL API.
-   **`packages/graphql`**: A shared package for generated GraphQL types and client-side queries.
-   **`packages/utils`**: A shared package for common utilities like error handling and authentication logic.
-   **`services/`**: Each subdirectory is a separate microservice:
    -   **`gateway`**: The Apollo Gateway, which federates the subgraphs from the other services.
    -   **`users`**: Manages user accounts, authentication, and roles.
    -   **`products`**: Manages product information, stock, and pricing.
    -   **`orders`**: Manages shopping carts, orders, and order items.

## 🛠️ Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [pnpm](https://pnpm.io/) (v8 or later)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for running a local PostgreSQL database)

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/marketmesh-graphql.git
cd marketmesh-graphql
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

This file contains the URLs for each service and the JWT secret. The default values should work for local development.

### 3. Start the Database

A local PostgreSQL instance is required. You can start one easily with Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL server on port `5432`.

### 4. Install Dependencies

Install all project dependencies using pnpm:

```bash
pnpm install
```

### 5. Run Database Migrations

Apply the Prisma schema migrations to your local database for each service that uses one:

```bash
pnpm --filter @marketmesh/users prisma migrate dev
pnpm --filter @marketmesh/products prisma migrate dev
pnpm --filter @marketmesh/orders prisma migrate dev
```

### 6. Generate GraphQL Types

Generate the TypeScript types for the frontend:

```bash
pnpm --filter @marketmesh/graphql generate
```

## 🏃‍♀️ Running the Application

To run the entire platform for development, you will need to start each service and the frontend in separate terminal windows.

**Terminal 1: Start the Gateway**
```bash
pnpm --filter @marketmesh/gateway dev
```

**Terminal 2: Start the Users Service**
```bash
pnpm --filter @marketmesh/users dev
```

**Terminal 3: Start the Products Service**
```bash
pnpm --filter @marketmesh/products dev
```

**Terminal 4: Start the Orders Service**
```bash
pnpm --filter @marketmesh/orders dev
```

**Terminal 5: Start the Frontend**
```bash
pnpm --filter @marketmesh/web dev
```

Once all services are running, you can access:

-   **Frontend**: `http://localhost:3000`
-   **GraphQL Playground**: `http://localhost:4000/graphql` (via the gateway)

##  API Usage

### Authentication

The API uses JWT for authentication. To perform authenticated actions, you must first register and log in.

**1. Register a User**
```graphql
mutation SignupUser {
  signup(input: {email: "test@example.com", password: "password123"}) {
    token
    user {
      id
      email
      role
    }
  }
}
```

**2. Log In**
```graphql
mutation LoginUser {
  login(input: {email: "test@example.com", password: "password123"}) {
    token
  }
}
```

**3. Make Authenticated Requests**

Include the returned token in the `Authorization` header of subsequent requests:

```
Authorization: Bearer <YOUR_TOKEN_HERE>
```

### Example Queries

**Fetch All Products**
```graphql
query GetProducts {
  products {
    id
    name
    price
  }
}
```

**Add a Product to the Cart (Authenticated)**
```graphql
mutation AddProductToCart {
  addProductToCart(productId: "your-product-id", quantity: 1) {
    id
    total
    items {
      id
      quantity
      product {
        id
        name
        price
      }
    }
  }
}
```

## 🧪 Testing

To run the tests for all services:

```bash
pnpm test
```

To run tests for a specific service:

```bash
pnpm --filter @marketmesh/users test
```