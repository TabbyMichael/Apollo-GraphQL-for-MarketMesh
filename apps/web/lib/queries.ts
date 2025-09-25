import { gql } from '@apollo/client';
import { PRODUCT_FRAGMENT, USER_FRAGMENT, ORDER_FRAGMENT } from '@marketmesh/graphql';

// Product Queries
export const GET_PRODUCTS = gql`
  query GetProducts($page: Int, $limit: Int, $search: String) {
    products(page: $page, limit: $limit, search: $search) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// Order Queries
export const GET_MY_ORDERS = gql`
  query GetMyOrders($status: OrderStatus, $page: Int, $limit: Int) {
    myOrders(status: $status, page: $page, limit: $limit) {
      ...OrderFields
    }
  }
  ${ORDER_FRAGMENT}
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderFields
    }
  }
  ${ORDER_FRAGMENT}
`;

// Mutations
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ...OrderFields
    }
  }
  ${ORDER_FRAGMENT}
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const SIGNUP = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;
