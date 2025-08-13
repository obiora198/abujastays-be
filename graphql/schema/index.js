const { mergeTypeDefs } = require("@graphql-tools/merge");

const baseSchema = require("./base");
const authSchema = require("./auth");
const propertySchema = require("./property");
const bookingSchema = require("./booking");
const reviewSchema = require("./reviews");

module.exports = mergeTypeDefs([
  baseSchema,
  authSchema,
  propertySchema,
  bookingSchema,
  reviewSchema,
]);
