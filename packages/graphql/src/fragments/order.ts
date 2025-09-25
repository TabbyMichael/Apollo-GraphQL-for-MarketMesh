import { gql } from '@apollo/client';

export const ORDER_FRAGMENT = gql`
  fragment OrderFields on Order {
    id
    status
    total
    paymentMethod
    paymentStatus
    shippingAddress
    billingAddress
    items {
      id
      quantity
      price
      total
      product {
        id
        name
        price
      }
    }
    customer {
      id
      fullName
      email
    }
    createdAt
    updatedAt
  }
`;

export const ORDER_ITEM_FRAGMENT = gql`
  fragment OrderItemFields on OrderItem {
    id
    quantity
    price
    total
    product {
      id
      name
      price
    }
  }
`;
