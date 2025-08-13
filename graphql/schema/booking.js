const { gql } = require("graphql-tag");

module.exports = gql`
  type Booking {
    id: ID!
    property: Property!
    user: User!
    checkIn: String!
    checkOut: String!
    totalPrice: Int!
    status: String!
    paymentReference: String
    paymentStatus: String
    paymentMethod: String
    createdAt: String!
  }

  type PaymentResponse {
    success: Boolean!
    authorizationUrl: String
    reference: String
    amount: Int
    error: String
  }

  type PaymentVerificationResponse {
    success: Boolean!
    booking: Booking
    message: String
    error: String
  }

type Query {
  bookings: [Booking!]!
  booking(id: ID!): Booking
  bookingsByUser(userId: ID): [Booking!]!
  bookingsByProperty(propertyId: ID!): [Booking!]!
}

type Mutation {
  createBooking(propertyId: ID!, checkIn: String!, checkOut: String!): Booking!
  initializePayment(bookingId: ID!): PaymentResponse!
  verifyPayment(reference: String!): PaymentVerificationResponse!
  cancelBooking(id: ID!): Boolean!
}

`;

