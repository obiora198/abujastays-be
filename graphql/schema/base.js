const { gql } = require("graphql-tag");

module.exports = gql`
    scalar Upload

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type User {
    id: ID!
    email: String!
    name: String
    phone: String
    role: String!
    avatar: String
    isEmailVerified: Boolean
    emailNotifications: Boolean
  }
`;
