import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    firstName
    lastName
    fullName
    role
    createdAt
    updatedAt
  }
`;

export const AUTH_PAYLOAD_FRAGMENT = gql`
  fragment AuthPayloadFields on AuthPayload {
    token
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;
