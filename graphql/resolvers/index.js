const authResolvers = require("./auth");
const bookingResolvers = require("./booking");
const propertyResolvers = require("./property");
const reviewResolvers =  require("./reviews");
const { GraphQLUpload } = require("graphql-upload");

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    ...authResolvers.Query,
    ...propertyResolvers.Query,
    ...bookingResolvers.Query,
    ...reviewResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...propertyResolvers.Mutation,
    ...bookingResolvers.Mutation,
    ...reviewResolvers.Mutation,
  },
  User: {
    id: (parent) => parent._id || parent.id,
  },
  Property: {
    id: (parent) => parent._id || parent.id,
  },
  Booking: {
    id: (parent) => parent._id || parent.id,
  },
  Review: {
    id: (parent) => parent._id || parent.id,
  },
};

module.exports = resolvers;
