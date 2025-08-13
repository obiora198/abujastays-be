const Review = require('../../models/Review');
const Booking = require('../../models/Booking');

module.exports = {
  Query: {
    reviewsByProperty: (_, { propertyId }) => Review.find({ property: propertyId }),
  },

  Mutation: {
    leaveReview: async (_, { propertyId, rating, comment }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      // Optional: Check if user has a booking for this property
      const booking = await Booking.findOne({ property: propertyId, user: user.userId });
      if (!booking) throw new Error("You can only review properties you've booked");

      const review = await Review.create({
        property: propertyId,
        user: user.userId,
        rating,
        comment,
      });

      return review;
    },
  },

  Review: {
    property: (parent) => require('../../models/Property').findById(parent.property),
    user: (parent) => require('../../models/User').findById(parent.user),
  },
};
