const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { Schema, model, Types } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["traveler", "manager", "admin"],
      default: "traveler",
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
    },

    // Auth-related
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    lastOTPSent: Date,

    googleId: String,

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailNotifications: {
      type: Boolean,
      default: true,
    },

    // Relationships
    properties: [
      {
        type: Types.ObjectId,
        ref: "Property",
      },
    ],
    bookings: [
      {
        type: Types.ObjectId,
        ref: "Booking",
      },
    ],
    reviews: [
      {
        type: Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

//
// 🔐 Password hashing + instance methods
//

// Only hash password if it's modified
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare input password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification OTP token
userSchema.methods.generateEmailVerificationToken = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.emailVerificationToken = otp;
  this.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  return otp;
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

module.exports = model("User", userSchema);
