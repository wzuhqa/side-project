import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiShoppingCart, FiTrash2, FiHeart, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateCartItem, removeFromCart, saveForLater, moveToCart, clearCart } = useCart();

  const cartItems = cart?.items?.filter(item => !item.savedForLater) || [];
  const savedItems = cart?.items?.filter(item => item.savedForLater) || [];

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const discount = cart?.discount || 0;
  const total = subtotal - discount;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleRemove = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <>
      <Helmet>
        <title>Shopping Cart - ShopNow</title>
      </Helmet>

      <div className="cart-page">
        <div className="container">
          <h1 className="page-title">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <FiShoppingCart size={64} />
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-section">
                <div className="cart-header">
                  <span className="cart-header-item">Product</span>
                  <span className="cart-header-item">Price</span>
                  <span className="cart-header-item">Quantity</span>
                  <span className="cart-header-item">Total</span>
                  <span className="cart-header-item"></span>
                </div>

                <div className="cart-items">
                  {cartItems.map(item => {
                    const product = item.product || {};
                    const price = product.price || item.price || 0;
                    const totalPrice = price * item.quantity;
                    const image = product.images?.[0]?.url || '/placeholder.jpg';

                    return (
                      <div key={item._id} className="cart-item">
                        <div className="item-product">
                          <Link to={`/product/${product.slug}`} className="item-image">
                            <img src={image} alt={product.name || 'Product'} />
                          </Link>
                          <div className="item-details">
                            <Link to={`/product/${product.slug}`} className="item-name">
                              {product.name}
                            </Link>
                            {item.variant && (
                              <p className="item-variant">
                                {Object.entries(item.variant.attributes || {}).map(([key, val]) => 
                                  `${key}: ${val}`
                                ).join(', ')}
                              </p>
                            )}
                            <div className="item-actions">
                              <button 
                                onClick={() => saveForLater(item._id)}
                                className="item-action-btn"
                              >
                                Save for later
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="item-price">
                          ${price.toFixed(2)}
                        </div>

                        <div className="item-quantity">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus size={16} />
                            </button>
                            <span>{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="item-total">
                          ${totalPrice.toFixed(2)}
                        </div>

                        <div className="item-remove">
                          <button 
                            onClick={() => handleRemove(item._id)}
                            className="remove-btn"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Saved for Later */}
                {savedItems.length > 0 && (
                  <div className="saved-section">
                    <h3>Saved for Later ({savedItems.length})</h3>
                    <div className="saved-items">
                      {savedItems.map(item => {
                        const product = item.product || {};
                        const price = product.price || item.price || 0;
                        const image = product.images?.[0]?.url || '/placeholder.jpg';

                        return (
                          <div key={item._id} className="saved-item">
                            <img src={image} alt={product.name} className="saved-item-image" />
                            <div className="saved-item-details">
                              <Link to={`/product/${product.slug}`} className="saved-item-name">
                                {product.name}
                              </Link>
                              <p className="saved-item-price">${price.toFixed(2)}</p>
                              <button 
                                onClick={() => moveToCart(item._id)}
                                className="move-btn"
                              >
                                Move to Cart
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="cart-footer">
                  <button onClick={clearCart} className="clear-cart-btn">
                    Clear Cart
                  </button>
                  <Link to="/shop" className="continue-shopping">
                    <FiArrowRight size={18} />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="order-summary">
                <h3>Order Summary</h3>
                
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} items)</span>
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
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button onClick={handleCheckout} className="checkout-btn" disabled={loading}>
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>

                <div className="payment-methods">
                  <p>We accept:</p>
                  <div className="payment-icons">
                    <span className="payment-icon">Visa</span>
                    <span className="payment-icon">Mastercard</span>
                    <span className="payment-icon">PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .cart-page {
            padding: 32px 0 64px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 32px;
          }

          .empty-cart {
            text-align: center;
            padding: 80px 20px;
          }

          .empty-cart-icon {
            color: #d1d5db;
            margin-bottom: 24px;
          }

          .empty-cart h2 {
            font-size: 24px;
            margin-bottom: 12px;
          }

          .empty-cart p {
            color: #6b7280;
            margin-bottom: 32px;
          }

          .cart-layout {
            display: grid;
            grid-template-columns: 1fr 380px;
            gap: 32px;
          }

          .cart-items-section {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }

          .cart-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 50px;
            gap: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
          }

          .cart-items {
            margin-top: 16px;
          }

          .cart-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 50px;
            gap: 16px;
            padding: 24px 0;
            border-bottom: 1px solid #e5e7eb;
            align-items: center;
          }

          .item-product {
            display: flex;
            gap: 16px;
          }

          .item-image {
            width: 80px;
            height: 80px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .item-name {
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 4px;
            line-height: 1.4;
          }

          .item-variant {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .item-actions {
            display: flex;
            gap: 16px;
          }

          .item-action-btn {
            font-size: 13px;
            color: #2563eb;
            transition: color 0.2s;
          }

          .item-action-btn:hover {
            color: #1d4ed8;
          }

          .item-price,
          .item-total {
            font-weight: 600;
          }

          .quantity-controls {
            display: inline-flex;
            align-items: center;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
          }

          .quantity-controls button {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
          }

          .quantity-controls button:hover:not(:disabled) {
            background: #f3f4f6;
          }

          .quantity-controls button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .quantity-controls span {
            width: 40px;
            text-align: center;
            font-weight: 500;
          }

          .remove-btn {
            color: #ef4444;
            padding: 8px;
            border-radius: 6px;
            transition: background 0.2s;
          }

          .remove-btn:hover {
            background: #fef2f2;
          }

          .saved-section {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid #e5e7eb;
          }

          .saved-section h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
          }

          .saved-items {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .saved-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
          }

          .saved-item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
          }

          .saved-item-name {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .saved-item-price {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .move-btn {
            font-size: 13px;
            color: #2563eb;
          }

          .cart-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 24px;
          }

          .clear-cart-btn {
            color: #ef4444;
            font-size: 14px;
          }

          .continue-shopping {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #2563eb;
            font-weight: 500;
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

          .summary-rows {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 16px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
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
            margin-bottom: 24px;
          }

          .checkout-btn {
            width: 100%;
            padding: 16px;
            background: #2563eb;
            color: #fff;
            font-weight: 600;
            border-radius: 8px;
            transition: background 0.2s;
          }

          .checkout-btn:hover:not(:disabled) {
            background: #1d4ed8;
          }

          .checkout-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }

          .payment-methods {
            margin-top: 24px;
            text-align: center;
          }

          .payment-methods p {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 12px;
          }

          .payment-icons {
            display: flex;
            justify-content: center;
            gap: 8px;
          }

          .payment-icon {
            padding: 6px 12px;
            background: #f3f4f6;
            border-radius: 4px;
            font-size: 12px;
            color: #6b7280;
          }

          @media (max-width: 1024px) {
            .cart-layout {
              grid-template-columns: 1fr;
            }

            .cart-header {
              display: none;
            }

            .cart-item {
              grid-template-columns: 1fr;
              gap: 16px;
            }

            .item-product {
              flex-direction: column;
            }

            .item-image {
              width: 100%;
              height: 200px;
            }

            .saved-items {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default CartPage;
