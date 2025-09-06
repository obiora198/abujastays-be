const nodemailer = require('nodemailer');
const config = require('../config/email');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport(config.smtp);
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
    } catch (error) {
      console.error('❌ Email service configuration error:', error.message);
    }
  }

  async sendOTPEmail(to, code) {
    try {
      const mailOptions = {
        from: config.from,
        to,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Abuja Stays</h2>
            <p>Use the following code to verify your email address:</p>
            <div style="font-size: 24px; text-align: center; margin: 20px 0; letter-spacing: 4px;">
              <strong>${code}</strong>
            </div>
            <p>This code expires in 30 minutes.</p>
            <p>If you didn't request this, you can safely ignore it.</p>
            <hr style="border-top: 1px solid #ddd; margin-top: 30px;">
            <p style="font-size: 12px; color: #888;">This is an automated email. Do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending verification email:', error.message);
      throw new Error('Could not send verification email');
    }
  }

  async sendPasswordResetEmail(to, resetToken) {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: config.from,
        to,
        subject: 'Reset your password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </div>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, ignore this message.</p>
            <hr style="border-top: 1px solid #ddd; margin-top: 30px;">
            <p style="font-size: 12px; color: #888;">This is an automated email. Do not reply.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error.message);
      throw new Error('Could not send password reset email');
    }
  }

  async sendBookingConfirmationEmail(bookingData) {
    try {
      const { user, property, checkIn, checkOut, totalPrice, paymentReference } = bookingData;
      
      const checkInDate = new Date(checkIn).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const checkOutDate = new Date(checkOut).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: config.from,
        to: user.email,
        subject: `Booking Confirmed - ${property.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Your booking has been confirmed! Here are the details:
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4F46E5; margin-top: 0;">${property.name}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${property.location}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Check-in:</strong> ${checkInDate}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Check-out:</strong> ${checkOutDate}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Total Amount:</strong> ₦${totalPrice.toLocaleString()}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Payment Reference:</strong> ${paymentReference}</p>
              </div>
              
              <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #2d5a2d; margin-top: 0;">What's Next?</h4>
                <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                  <li>Save this email for your records</li>
                  <li>Present your payment reference at check-in</li>
                  <li>Contact the property if you need to modify your booking</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View My Bookings
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                If you have any questions, please contact our support team.
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px;">© 2024 Abuja Stays. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Booking confirmation email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking confirmation email:', error.message);
      throw new Error('Could not send booking confirmation email');
    }
  }

  async sendBookingCancellationEmail(bookingData) {
    try {
      const { user, property, checkIn, checkOut, totalPrice } = bookingData;
      
      const checkInDate = new Date(checkIn).toLocaleDateString('en-NG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: config.from,
        to: user.email,
        subject: `Booking Cancelled - ${property.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Booking Cancelled</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Your booking has been cancelled. Here are the details:
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #dc3545; margin-top: 0;">${property.name}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Location:</strong> ${property.location}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Check-in:</strong> ${checkInDate}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Total Amount:</strong> ₦${totalPrice.toLocaleString()}</p>
              </div>
              
              <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #856404; margin-top: 0;">Refund Information</h4>
                <p style="color: #666; margin: 10px 0;">
                  If you paid for this booking, a refund will be processed within 3-5 business days.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/hotels" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Browse More Hotels
                </a>
              </div>
              
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                If you have any questions about your refund, please contact our support team.
              </p>
            </div>
            
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px;">© 2024 Abuja Stays. All rights reserved.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Booking cancellation email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Error sending booking cancellation email:', error.message);
      throw new Error('Could not send booking cancellation email');
    }
  }
}

module.exports = new EmailService();
