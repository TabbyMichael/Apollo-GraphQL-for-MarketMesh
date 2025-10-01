import { AuthenticationError, ForbiddenError } from 'apollo-server-errors';
import { Resolvers } from '../generated/graphql';
import { Context } from '../context';

const resolvers: Resolvers = {
  Product: {
    // Resolve the seller field by returning a reference to the User type
    seller: (product) => {
      return { __typename: 'User', id: product.sellerId };
    },
  },
  Query: {
    products: (_, { name, minPrice, maxPrice, sellerId, page, limit }, { productService }) => {
      return productService.products(name, minPrice, maxPrice, sellerId, page, limit);
    },
    product: (_, { id }, { productService }) => {
      return productService.product(id);
    },
  },
  Mutation: {
    createProduct: (_, { input }, { productService, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to create a product.');
      }
      // The service will validate that the input's sellerId matches the authenticated user
      return productService.createProduct(input, userId);
    },
    updateProduct: (_, { id, input }, { productService, userId, userRole }) => {
      if (!userId || !userRole) {
        throw new AuthenticationError('You must be logged in to update a product.');
      }
      return productService.updateProduct(id, input, userId, userRole);
    },
    deleteProduct: async (_, { id }, { productService, userId, userRole }) => {
      if (!userId || !userRole) {
        throw new AuthenticationError('You must be logged in to delete a product.');
      }
      return productService.deleteProduct(id, userId, userRole);
    },
  },
};

export default resolvers;
