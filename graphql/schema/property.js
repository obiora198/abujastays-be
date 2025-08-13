const { gql } = require("graphql-tag");

module.exports = gql`
  type Property {
    id: ID!
    name: String!
    location: String!
    description: String
    pricePerNight: Int!
    verified: Boolean!
    images: [String!]!
    owner: User!
    bookings: [Booking!]!
    reviews: [Review!]!
  }

  extend type Query {
    properties(location: String, maxPrice: Int): [Property!]!
    property(id: ID!): Property
    propertiesByOwner(ownerId: ID!): [Property!]!
  }

  extend type Mutation {
    createProperty(
      name: String!
      location: String!
      description: String
      pricePerNight: Int!
      images: [String!]
    ): Property!

    updateProperty(
      id: ID!
      name: String
      location: String
      description: String
      pricePerNight: Int
      images: [String!]
      verified: Boolean
    ): Property!

    deleteProperty(id: ID!): Boolean!
  }
`;
