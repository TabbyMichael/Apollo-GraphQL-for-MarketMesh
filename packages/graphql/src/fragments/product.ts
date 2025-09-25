import { gql } from '@apollo/client';

export const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    description
    price
    stock
    seller {
      id
      email
      fullName
    }
    createdAt
    updatedAt
  }
`;

export const PRODUCT_CARD_FRAGMENT = gql`
  fragment ProductCardFields on Product {
    id
    name
    price
    seller {
      id
      fullName
    }
  }
`;
