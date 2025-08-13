const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose

const bookingSchema = new Schema(
  {
    property: {
      type: Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'paid', 'payment_failed'],
      default: 'pending',
    },
    // Payment information
    paymentReference: {
      type: String,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'paystack',
    },
    paymentData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = model('Booking', bookingSchema)
