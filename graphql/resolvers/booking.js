const Booking = require('../../models/Booking');
const Property = require('../../models/Property');
const User = require('../../models/User');
const paystackService = require('../../services/paystackService');
const emailService = require('../../services/emailService');

module.exports = {
  Query: {
    bookings: () => Booking.find().populate('user property'),
    booking: (_, { id }) => Booking.findById(id),
    bookingsByUser: async (_, { userId }, { user }) => {
      try {
        
        if (!user) {
          throw new AuthenticationError('You must be logged in to view bookings');
        }
    
        const targetUserId = userId || user.userId;
    
        const bookings = await Booking.find({ user: targetUserId })
          .populate('property')
          .lean();
  
        return bookings;
      } catch (error) {
        console.error("Error in bookingsByUser resolver:", error);
        throw error;
      }
    },
    bookingsByProperty: (_, { propertyId }) => Booking.find({ property: propertyId }),
  },

  Mutation: {
    createBooking: async (_, { propertyId, checkIn, checkOut }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const property = await Property.findById(propertyId);
      if (!property) throw new Error('Property not found');

      // Prevent double-booking: check for overlapping bookings
      const overlapping = await Booking.findOne({
        property: propertyId,
        status: { $nin: ['cancelled', 'payment_failed'] },
        $or: [
          {
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) }
          }
        ]
      });
      if (overlapping) {
        throw new Error('This property is already booked for the selected dates.');
      }

      const days = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      const totalPrice = days * property.pricePerNight;

      const booking = await Booking.create({
        property: propertyId,
        user: user.userId,
        checkIn,
        checkOut,
        totalPrice,
        status: 'pending',
      });

      return booking;
    },

    initializePayment: async (_, { bookingId }, { user }) => {
      if (!user) throw new Error('Not authenticated');

      const booking = await Booking.findById(bookingId).populate('property user');
      if (!booking) throw new Error('Booking not found');
      if (String(booking.user._id) !== user.userId) throw new Error('Forbidden');

      if (booking.paymentStatus === 'success') {
        throw new Error('Payment already completed for this booking');
      }

      const reference = paystackService.generateReference();
      const callbackUrl = `${process.env.FRONTEND_URL}/payment/verify?reference=${reference}`;

      const paymentData = {
        email: booking.user.email,
        amount: booking.totalPrice,
        reference,
        callback_url: callbackUrl,
        metadata: {
          bookingId: booking._id.toString(),
          propertyName: booking.property.name,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        }
      };

      const result = await paystackService.initializePayment(paymentData);
      
      if (result.success) {
        // Update booking with payment reference
        booking.paymentReference = reference;
        await booking.save();

        return {
          success: true,
          authorizationUrl: result.data.authorization_url,
          reference,
          amount: booking.totalPrice,
        };
      } else {
        throw new Error(result.error);
      }
    },

    verifyPayment: async (_, { reference }) => {
      const result = await paystackService.verifyPayment(reference);
      
      if (result.success) {
        const booking = await Booking.findOne({ paymentReference: reference }).populate('property user');
        if (!booking) throw new Error('Booking not found');

        // Update booking status
        booking.paymentStatus = 'success';
        booking.status = 'confirmed';
        booking.paymentData = result.data;
        await booking.save();

        // Send confirmation email
        try {
          await emailService.sendBookingConfirmationEmail({
            user: booking.user,
            property: booking.property,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            totalPrice: booking.totalPrice,
            paymentReference: booking.paymentReference
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the payment verification if email fails
        }

        return {
          success: true,
          booking,
          message: 'Payment verified successfully'
        };
      } else {
        // Update booking status to payment failed
        const booking = await Booking.findOne({ paymentReference: reference });
        if (booking) {
          booking.paymentStatus = 'failed';
          booking.status = 'payment_failed';
          await booking.save();
        }

        throw new Error(result.error);
      }
    },

    cancelBooking: async (_, { id }, { user }) => {
      const booking = await Booking.findById(id).populate('property user');
      if (!booking) throw new Error('Booking not found');
      if (String(booking.user._id) !== user.userId) throw new Error('Forbidden');

      booking.status = 'cancelled';
      await booking.save();

      // Send cancellation email
      try {
        await emailService.sendBookingCancellationEmail({
          user: booking.user,
          property: booking.property,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.totalPrice
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
        // Don't fail the cancellation if email fails
      }

      return true;
    },
  },

  Booking: {
    property: (parent) => Property.findById(parent.property),
    user: (parent) => require('../../models/User').findById(parent.user),
  },
};
