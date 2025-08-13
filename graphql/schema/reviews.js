const { gql } = require("graphql-tag");

module.exports = gql`
  type Review {
  id: ID!
  rating: Int!
  comment: String
  user: User!
  property: Property!
  createdAt: String!
}

type Query {
  reviewsByProperty(propertyId: ID!): [Review!]!
}

type Mutation {
  leaveReview(propertyId: ID!, rating: Int!, comment: String): Review!
}

`;
