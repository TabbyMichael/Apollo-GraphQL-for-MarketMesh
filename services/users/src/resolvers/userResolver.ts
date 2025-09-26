import { ForbiddenError, AuthenticationError } from 'apollo-server-errors';
import { Resolvers } from '../generated/graphql';
import { Context } from '../context';

const resolvers: Resolvers<Context> = {
  User: {
    fullName: (user) => {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      return user.firstName || user.lastName || '';
    },
  },
  Query: {
    me: (_, __, { userId, userService }) => {
      if (!userId) {
        throw new AuthenticationError('Not authenticated');
      }
      return userService.me(userId);
    },
    user: (_, { id }, { userId, role, userService }) => {
      return userService.user(id, userId!, role!);
    },
    users: (_, { role, page, limit }, { role: userRole, userService }) => {
      if (userRole !== 'ADMIN') {
        throw new ForbiddenError('Not authorized');
      }
      return userService.users(role, page, limit);
    },
  },
  Mutation: {
    signup: (_, { input }, { userService }) => {
      return userService.signup(input);
    },
    
    login: (_, { input }, { userService }) => {
      return userService.login(input);
    },
    
    updateProfile: (_, { input }, { userId, userService }) => {
      if (!userId) {
        throw new AuthenticationError('Not authenticated');
      }
      return userService.updateProfile(userId, input);
    },
    
    deleteAccount: (_, __, { userId, userService }) => {
      if (!userId) {
        throw new AuthenticationError('Not authenticated');
      }
      return userService.deleteAccount(userId);
    },
  },
};

export default resolvers;