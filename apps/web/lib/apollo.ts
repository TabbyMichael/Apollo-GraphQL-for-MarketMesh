import { ApolloClient, InMemoryCache } from '@apollo/client';

const apolloClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

export default apolloClient;