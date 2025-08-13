const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose

const propertySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: String, // Store image URLs or Cloudinary public IDs
      },
    ],
    owner: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookings: [
      {
        type: Types.ObjectId,
        ref: 'Booking',
      },
    ],
    reviews: [
      {
        type: Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  { timestamps: true }
)

module.exports = model('Property', propertySchema)
