const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

class PaystackService {
  constructor() {
    this.paystack = Paystack;
  }

  // Initialize payment
  async initializePayment(bookingData) {
    try {
      const { email, amount, reference, callback_url, metadata } = bookingData;
      
      const response = await this.paystack.transaction.initialize({
        email,
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        reference,
        callback_url,
        metadata
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment
  async verifyPayment(reference) {
    try {
      const response = await this.paystack.transaction.verify(reference);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate unique reference
  generateReference() {
    return `ABUJA_BOOKING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  }
}

module.exports = new PaystackService(); 