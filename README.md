# MarketMesh - Federated GraphQL E-commerce Platform

[![Build Status](https://img.shields.io/github/actions/workflow/status/your-username/marketmesh-graphql/ci.yml?branch=main&style=for-the-badge)](https://github.com/your-username/marketmesh-graphql/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-orange.svg?style=for-the-badge)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=for-the-badge)](https://www.typescriptlang.org/)

**MarketMesh** is a modern, scalable e-commerce platform built on a federated GraphQL API. It leverages a microservices architecture to create a flexible and maintainable system, with a Next.js frontend for a seamless user experience.

---

## 📖 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [🏃‍♀️ Running the Application](#️-running-the-application)
- [⚙️ Configuration](#️-configuration)
- [🧪 Testing](#-testing)
- [🤝 Contribution Guidelines](#-contribution-guidelines)
- [🛣️ Roadmap](#️-roadmap)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Key Features

-   **Federated GraphQL API**: A single, unified data graph powered by multiple independent microservices using **Apollo Federation v2**.
-   **Clean Microservices Architecture**: Each core domain (users, products, orders) is a separate, independently deployable service, promoting separation of concerns and team autonomy.
-   **End-to-End Type Safety**: Leverages TypeScript across the entire stack, with generated types from GraphQL schemas ensuring consistency between the frontend and backend.
-   **Modern, Scalable Stack**: Built with Node.js, TypeScript, Apollo Server, Prisma, Next.js, and Material-UI.
-   **Efficient Monorepo**: Managed with `pnpm` workspaces for optimized dependency management and local development.
-   **Database Per Service**: Each service has its own isolated database schema, managed with Prisma migrations.

---

## 🏗️ Architecture Overview

The platform is a pnpm monorepo consisting of several packages, each with a distinct responsibility. This design allows for independent development, testing, and deployment of each component.

![Architecture Diagram](https://i.imgur.com/U4aF4gU.png)

-   **`apps/web`**: The Next.js frontend application that consumes the GraphQL API.
-   **`packages/graphql`**: A shared package for generated GraphQL types and client-side queries.
-   **`packages/utils`**: A shared package for common utilities like error handling and authentication logic.
-   **`services/`**: Each subdirectory is a separate microservice:
    -   **`gateway`**: The Apollo Gateway, which federates the subgraphs from the other services.
    -   **`users`**: Manages user accounts, authentication (JWT), and roles.
    -   **`products`**: Manages product information, stock, and pricing.
    -   **`orders`**: Manages shopping carts, orders, and order items.

---

## 🛠️ Tech Stack

| Area      | Technologies                                            |
| :-------- | :------------------------------------------------------ |
| **Backend** | Node.js, TypeScript, Apollo Server, Apollo Federation, Prisma |
| **Frontend**| Next.js, React, TypeScript, Apollo Client, Material-UI      |
| **Database**| PostgreSQL                                              |
| **Tooling** | pnpm, Docker, Jest, ESLint, GraphQL Code Generator        |

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [pnpm](https://pnpm.io/) (v8 or later)
-   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Installation & Setup

**1. Clone the Repository**

```bash
git clone https://github.com/marketmesh/marketmesh-graphql.git
cd marketmesh-graphql
```

**2. Set Up Environment Variables**

Create a `.env` file in the root of the project by copying the example file. The default values are configured for the local Docker setup.

```bash
cp .env.example .env
```

**3. Start the Database**

A local PostgreSQL instance is required. You can start one easily with Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL server on port `5432`.

**4. Install Dependencies**

Install all project dependencies using pnpm. This will install dependencies for all workspaces (`apps`, `packages`, and `services`).

```bash
pnpm install
```

**5. Run Database Migrations**

Apply the Prisma schema migrations to your local database for each service:

```bash
pnpm --filter @marketmesh/users prisma migrate dev
pnpm --filter @marketmesh/products prisma migrate dev
pnpm --filter @marketmesh/orders prisma migrate dev
```

**6. Generate GraphQL Types**

Generate the TypeScript types that the frontend will use to interact with the API:

```bash
pnpm --filter @marketmesh/graphql generate
```

---

## 🏃‍♀️ Running the Application

To run the entire platform for development, you will need to start each service and the frontend in **separate terminal windows**.

| Service         | Command                                |
| :-------------- | :------------------------------------- |
| **Gateway**     | `pnpm --filter @marketmesh/gateway dev`  |
| **Users Service** | `pnpm --filter @marketmesh/users dev`    |
| **Products Service**| `pnpm --filter @marketmesh/products dev` |
| **Orders Service**  | `pnpm --filter @marketmesh/orders dev`   |
| **Frontend**    | `pnpm --filter @marketmesh/web dev`      |

Once all services are running, you can access:

-   **Frontend Application**: `http://localhost:3000`
-   **GraphQL Playground**: `http://localhost:4000/graphql` (via the gateway)

---

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
# Example for the 'users' service
pnpm --filter @marketmesh/users test
```

The tests use **Jest** and `ts-jest`, with `jest-mock-extended` for mocking Prisma clients to ensure tests are isolated and do not require a database connection.

---

## 🤝 Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  **Fork** the repository.
2.  Create a new branch (`git checkout -b feature/my-new-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/my-new-feature`).
6.  Open a **Pull Request**.

Please ensure your code adheres to the existing style and that all tests pass.

---

## 🛣️ Roadmap

-   [ ] **Payments Service**: Full implementation with a payment provider like Stripe.
-   [ ] **Notifications Service**: Implement email/SMS notifications for key events (e.g., order confirmation).
-   [ ] **Enhanced Frontend**: Build out the full UI for product details, user profiles, and the checkout flow.
-   [ ] **CI/CD Pipeline**: Full continuous integration and deployment pipeline.
-   [ ] **Production Deployment**: Kubernetes manifests or other infrastructure-as-code for production deployment.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

-   [Apollo GraphQL](https://www.apollographql.com/) for their powerful federation tools.
-   [Prisma](https://www.prisma.io/) for their next-generation ORM.
-   [Next.js](https://nextjs.org/) for the excellent React framework.
-   The open-source community for providing the amazing libraries that make this project possible.
```