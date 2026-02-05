import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiCreditCard, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, fetchCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  const cartItems = cart?.items?.filter(item => !item.savedForLater) || [];
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const discount = cart?.discount || 0;
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: { type: paymentMethod },
        coupon: cart?.coupon || undefined
      };

      const response = await api.createOrder(orderData);
      const order = response.data.data;

      // Clear cart after successful order
      await clearCart();
      
      toast.success('Order placed successfully!');
      navigate(`/account/orders/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout - ShopNow</title>
      </Helmet>

      <div className="checkout-page">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FiArrowLeft size={20} />
            Back
          </button>

          <h1 className="page-title">Checkout</h1>

          {/* Progress Steps */}
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
          </div>

          <div className="checkout-layout">
            <div className="checkout-form">
              {step === 1 && (
                <form onSubmit={handleShippingSubmit} className="form-section">
                  <h2>Shipping Address</h2>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address Line 1 *</label>
                    <input
                      type="text"
                      value={shippingAddress.address1}
                      onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Address Line 2</label>
                    <input
                      type="text"
                      value={shippingAddress.address2}
                      onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg continue-btn">
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 2 && (
                <div className="form-section">
                  <h2>Payment Method</h2>
                  
                  <div className="payment-methods">
                    <label className={`payment-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <FiCreditCard size={24} />
                        <div>
                          <span className="payment-title">Credit / Debit Card</span>
                          <span className="payment-desc">Visa, Mastercard, Amex</span>
                        </div>
                      </div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="payment-option-content">
                        <span className="payment-logo">PayPal</span>
                        <div>
                          <span className="payment-title">PayPal</span>
                          <span className="payment-desc">Pay with your PayPal account</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'credit_card' && (
                    <div className="card-form">
                      <div className="form-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date</label>
                          <input type="text" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label>CVC</label>
                          <input type="text" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="billing-same">
                    <label>
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                      />
                      Billing address same as shipping
                    </label>
                  </div>

                  <div className="checkout-actions">
                    <button onClick={() => setStep(1)} className="btn btn-secondary">
                      Back
                    </button>
                    <button 
                      onClick={handlePayment} 
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                  </div>

                  <div className="secure-checkout">
                    <FiLock size={16} />
                    <span>Your payment information is secure</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                {cartItems.map(item => {
                  const product = item.product || {};
                  const price = product.price || item.price || 0;
                  const image = product.images?.[0]?.url || '/placeholder.jpg';

                  return (
                    <div key={item._id} className="summary-item">
                      <img src={image} alt={product.name} />
                      <div className="summary-item-details">
                        <p className="item-name">{product.name}</p>
                        <p className="item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="item-price">${(price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .checkout-page {
            padding: 32px 0 64px;
          }

          .back-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            margin-bottom: 24px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 32px;
          }

          .checkout-steps {
            display: flex;
            align-items: center;
            margin-bottom: 48px;
          }

          .step {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .step-number {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e5e7eb;
            color: #6b7280;
            border-radius: 50%;
            font-weight: 600;
          }

          .step.active .step-number {
            background: #2563eb;
            color: #fff;
          }

          .step-label {
            font-weight: 500;
            color: #6b7280;
          }

          .step.active .step-label {
            color: #1f2937;
          }

          .step-line {
            width: 100px;
            height: 2px;
            background: #e5e7eb;
            margin: 0 16px;
          }

          .checkout-layout {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 48px;
          }

          .form-section {
            background: #fff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .form-section h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 16px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
          }

          .form-group input:focus {
            outline: none;
            border-color: #2563eb;
          }

          .continue-btn {
            width: 100%;
            margin-top: 24px;
          }

          .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
          }

          .payment-option {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .payment-option.active {
            border-color: #2563eb;
            background: #eff6ff;
          }

          .payment-option input {
            accent-color: #2563eb;
          }

          .payment-option-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .payment-title {
            display: block;
            font-weight: 500;
          }

          .payment-desc {
            font-size: 13px;
            color: #6b7280;
          }

          .payment-logo {
            font-weight: 700;
            font-size: 18px;
          }

          .card-form {
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
          }

          .billing-same {
            margin: 24px 0;
          }

          .billing-same label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
          }

          .checkout-actions {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
          }

          .checkout-actions .btn-primary {
            flex: 1;
          }

          .secure-checkout {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #6b7280;
            font-size: 14px;
          }

          .order-summary {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            height: fit-content;
            position: sticky;
            top: 100px;
          }

          .order-summary h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 24px;
          }

          .summary-items {
            margin-bottom: 24px;
          }

          .summary-item {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .summary-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
          }

          .summary-item-details {
            flex: 1;
          }

          .item-name {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .item-qty {
            font-size: 13px;
            color: #6b7280;
          }

          .item-price {
            font-weight: 600;
          }

          .summary-totals {
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .summary-row.discount {
            color: #10b981;
          }

          .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 700;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
          }

          @media (max-width: 1024px) {
            .checkout-layout {
              grid-template-columns: 1fr;
            }

            .order-summary {
              order: -1;
              position: static;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default CheckoutPage;
