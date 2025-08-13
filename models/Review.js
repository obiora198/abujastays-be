const mongoose = require('mongoose')
const { Schema, model, Types } = mongoose

const reviewSchema = new Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

module.exports = model('Review', reviewSchema)
