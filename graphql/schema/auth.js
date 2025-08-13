const { gql } = require("graphql-tag");

module.exports = gql`
 type AuthPayload {
  token: String!
  user: User!
  message: String
}

input SignUpInput {
  name: String!
  email: String!
  password: String!
  phone: String
}

input LoginInput {
  email: String!
  password: String!
}

type Query {
  currentUser: User
}

type Mutation {
  register(input: SignUpInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  loginWithGoogle(idToken: String!): AuthPayload!
  verifyEmail(otp: String!): AuthPayload!
  resendOTP(email: String!): Boolean!
  forgotPassword(email: String!): Boolean!
  resetPassword(token: String!, password: String!): AuthPayload!
}

`;
