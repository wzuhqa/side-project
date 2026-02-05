import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    try {
      await api.subscribeNewsletter({ email });
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3>Subscribe to our newsletter</h3>
            <p>Get the latest updates on new products and upcoming sales</p>
          </div>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-btn" disabled={subscribing}>
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>

        {/* Main Footer Content */}
        <div className="footer-content">
          {/* About */}
          <div className="footer-section">
            <h4>About ShopNow</h4>
            <p>Your one-stop destination for premium products at unbeatable prices. We're committed to quality, fast shipping, and excellent customer service.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiTwitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiInstagram size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/shop?category=electronics">Electronics</Link></li>
              <li><Link to="/shop?category=fashion">Fashion</Link></li>
              <li><Link to="/shop?category=home">Home & Garden</Link></li>
              <li><Link to="/sale">Sale</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns & Exchanges</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/track-order">Track Order</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>Contact Us</h4>
            <ul className="contact-info">
              <li>
                <FiMapPin size={18} />
                <span>123 Commerce Street, New York, NY 10001</span>
              </li>
              <li>
                <FiPhone size={18} />
                <span>+1 (555) 123-4567</span>
              </li>
              <li>
                <FiMail size={18} />
                <span>support@shopnow.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ShopNow. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/accessibility">Accessibility</Link>
          </div>
          <div className="payment-methods">
            <span>We Accept:</span>
            <img src="/images/payment-methods.png" alt="Payment Methods" className="payment-icons" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #1f2937;
          color: #d1d5db;
          margin-top: auto;
        }

        .footer-newsletter {
          background: #2563eb;
          padding: 48px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        .newsletter-content h3 {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .newsletter-content p {
          color: rgba(255,255,255,0.8);
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          flex: 1;
          max-width: 400px;
        }

        .newsletter-input {
          flex: 1;
          padding: 14px 18px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
        }

        .newsletter-input:focus {
          outline: none;
        }

        .newsletter-btn {
          padding: 14px 28px;
          background: #1f2937;
          color: #fff;
          font-weight: 600;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .newsletter-btn:hover {
          background: #374151;
        }

        .newsletter-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px;
          padding: 64px 0;
        }

        .footer-section h4 {
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .footer-section p {
          font-size: 14px;
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .social-links {
          display: flex;
          gap: 12px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #374151;
          color: #fff;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .social-link:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        .footer-links {
          list-style: none;
        }

        .footer-links li {
          margin-bottom: 12px;
        }

        .footer-links a {
          font-size: 14px;
          color: #d1d5db;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #fff;
        }

        .contact-info {
          list-style: none;
        }

        .contact-info li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .contact-info svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding: 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        }

        .footer-bottom-links {
          display: flex;
          gap: 24px;
        }

        .footer-bottom-links a {
          color: #9ca3af;
          transition: color 0.2s;
        }

        .footer-bottom-links a:hover {
          color: #fff;
        }

        .payment-methods {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .payment-icons {
          height: 24px;
          opacity: 0.7;
        }

        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .footer-newsletter {
            flex-direction: column;
            text-align: center;
          }

          .newsletter-form {
            flex-direction: column;
            max-width: 100%;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}

export default Footer;
