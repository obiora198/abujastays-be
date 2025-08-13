const { AuthenticationError, UserInputError } = require("apollo-server-express");
const { OAuth2Client } = require("google-auth-library");

const User = require("../../models/User");
const emailService = require("../../services/emailService");
const { generateToken } = require("../../utils/token");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authResolvers = {
  Query: {
    currentUser: async (_, __, { user }) => {
      if (!user) return null;
      return await User.findById(user.userId);
    },
  },

  Mutation: {
    register: async (_, { input: { name, email, password, phone } }) => {
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        throw new UserInputError("Invalid email format");
      if (password.length < 8)
        throw new UserInputError("Password must be at least 8 characters");

      const existing = await User.findOne({ email });
      if (existing) throw new UserInputError("Email already registered");

      const user = await User.create({
        name,
        email,
        password,
        phone,
        isEmailVerified: false,
        lastOTPSent: new Date(),
      });

      const otp = user.generateEmailVerificationToken();
      await user.save();
      await emailService.sendOTPEmail(email, otp);

      const token = generateToken(user);
      return {
        token,
        user,
        message: "Please check your email for verification code",
      };
    },

    login: async (_, { input: { email, password } }) => {
      const user = await User.findOne({ email });
      if (!user || !user.password)
        throw new UserInputError("Invalid email or password");

      const valid = await user.comparePassword(password);
      if (!valid) throw new UserInputError("Invalid password");

      if (!user.isEmailVerified) {
        const otp = user.generateEmailVerificationToken();
        user.lastOTPSent = new Date();
        await user.save();
        await emailService.sendOTPEmail(email, otp);
      }

      const token = generateToken(user);
      return {
        token,
        user,
        message: user.isEmailVerified
          ? null
          : "Please check your email for verification code",
      };
    },

    loginWithGoogle: async (_, { idToken }) => {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid Google token");

      const { email, name, picture, sub: googleId } = payload;
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name,
          email,
          avatar: picture,
          googleId,
          isEmailVerified: true,
        });
      }

      const token = generateToken(user);
      return { token, user, message: "Login successful" };
    },

    verifyEmail: async (_, { otp }, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const foundUser = await User.findById(user.userId);
      if (!foundUser || !foundUser.emailVerificationToken)
        throw new UserInputError("No verification code found");

      if (foundUser.emailVerificationExpires < new Date())
        throw new UserInputError("Verification code has expired");

      if (foundUser.emailVerificationToken !== otp)
        throw new UserInputError("Invalid verification code");

      foundUser.isEmailVerified = true;
      foundUser.emailVerificationToken = null;
      foundUser.emailVerificationExpires = null;
      await foundUser.save();

      const newToken = generateToken(foundUser);
      return {
        token: newToken,
        user: foundUser,
        message: "Email verified successfully",
      };
    },

    resendOTP: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) return true;

      if (user.isEmailVerified)
        throw new UserInputError("Email is already verified");

      const lastSent = user.lastOTPSent ? new Date(user.lastOTPSent) : null;
      if (lastSent && Date.now() - lastSent.getTime() < 30000) {
        throw new UserInputError("Please wait before requesting another code");
      }

      const otp = user.generateEmailVerificationToken();
      user.lastOTPSent = new Date();
      await user.save();
      await emailService.sendOTPEmail(email, otp);

      return true;
    },

    forgotPassword: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) throw new UserInputError("User not found");

      const token = user.generatePasswordResetToken();
      await user.save();
      await emailService.sendPasswordResetEmail(email, token);

      return true;
    },

    resetPassword: async (_, { token, password }) => {
      const user = await User.findOne({ passwordResetToken: token });
      if (!user) throw new UserInputError("Invalid or expired reset token");

      if (user.passwordResetExpires < Date.now())
        throw new UserInputError("Reset token has expired");

      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      const newToken = generateToken(user);
      return {
        token: newToken,
        user,
        message: "Password reset successful",
      };
    },
  },
};

module.exports = authResolvers;
