const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

class PaymentService {
  // Create a payment intent
  async createPaymentIntent(order, customerId = null) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.pricing.total * 100), // Convert to cents
        currency: order.pricing.currency?.toLowerCase() || 'usd',
        customer: customerId,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber
        },
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Order ${order.orderNumber}`,
        receipt_email: order.user?.email
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Create payment intent error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Confirm payment error:', error);
      throw new Error('Failed to confirm payment');
    }
  }

  // Create customer
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });

      return customer;
    } catch (error) {
      console.error('Create customer error:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Get customer
  async getCustomer(customerId) {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      console.error('Get customer error:', error);
      return null;
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Create refund error:', error);
      throw new Error('Failed to create refund');
    }
  }

  // List payment methods for customer
  async listPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('List payment methods error:', error);
      return [];
    }
  }

  // Create setup intent for saving cards
  async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card']
      });

      return {
        clientSecret: setupIntent.client_secret
      };
    } catch (error) {
      console.error('Create setup intent error:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return { type: 'payment_success', data: event.data.object };
      
      case 'payment_intent.payment_failed':
        return { type: 'payment_failed', data: event.data.object };
      
      case 'charge.refunded':
        return { type: 'refund', data: event.data.object };
      
      default:
        return { type: 'unknown', data: event.data.object };
    }
  }

  // Construct webhook event
  constructEvent(payload, signature, webhookSecret) {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

module.exports = new PaymentService();
