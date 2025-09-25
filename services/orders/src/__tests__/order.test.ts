import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import resolvers from '../resolvers/orderResolver';
import { prismaMock } from './setup';

const typeDefs = gql(readFileSync('./src/schema.graphql', { encoding: 'utf-8' }));

const testServer = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

describe('Order Service', () => {
  it('adds a product to the cart', async () => {
    const cart = {
      id: '1',
      userId: '1',
      status: 'DRAFT',
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItem = {
      id: '1',
      orderId: '1',
      productId: '1',
      quantity: 1,
      price: 0, // Price is a placeholder
    };

    prismaMock.order.findFirst.mockResolvedValue(null); // No existing cart
    prismaMock.order.create.mockResolvedValue(cart);
    prismaMock.orderItem.create.mockResolvedValue(orderItem);
    prismaMock.order.findUnique.mockResolvedValue({ ...cart, items: [orderItem] });

    const response = await testServer.executeOperation(
      {
        query: gql`
          mutation AddProductToCart($productId: ID!, $quantity: Int!) {
            addProductToCart(productId: $productId, quantity: $quantity) {
              id
              items {
                id
                quantity
              }
            }
          }
        `,
        variables: {
          productId: '1',
          quantity: 1,
        },
      },
      {
        contextValue: {
          user: { userId: '1', role: 'CUSTOMER' },
        },
      }
    );

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.addProductToCart.id).toBe('1');
    expect(response.body.singleResult.data?.addProductToCart.items[0].quantity).toBe(1);
  });
});