import { gql } from '@apollo/client';

export const ProductFragment = gql`
  fragment ProductFields on Product {
    id
    name
    price
    seller {
      id
      name
    }
  }
`;