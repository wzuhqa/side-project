import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate(redirectTo);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - ShopNow</title>
      </Helmet>

      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="social-auth">
              <button className="social-btn">
                <img src="https://www.google.com/favicon.ico" alt="Google" />
                Google
              </button>
              <button className="social-btn">
                <img src="https://www.facebook.com/favicon.ico" alt="Facebook" />
                Facebook
              </button>
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}>
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <style jsx>{`
          .auth-page {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #f9fafb;
          }

          .auth-container {
            width: 100%;
            max-width: 440px;
          }

          .auth-card {
            background: #fff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          }

          .auth-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .auth-header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .auth-header p {
            color: #6b7280;
          }

          .auth-form {
            margin-bottom: 24px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
          }

          .input-with-icon {
            position: relative;
          }

          .input-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }

          .input-with-icon input {
            width: 100%;
            padding: 14px 48px 14px 48px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
          }

          .input-with-icon input:focus {
            outline: none;
            border-color: #2563eb;
          }

          .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            cursor: pointer;
          }

          .forgot-link {
            font-size: 14px;
            color: #2563eb;
          }

          .auth-divider {
            display: flex;
            align-items: center;
            gap: 16px;
            margin: 24px 0;
          }

          .auth-divider::before,
          .auth-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
          }

          .auth-divider span {
            font-size: 14px;
            color: #9ca3af;
          }

          .social-auth {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }

          .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.2s;
          }

          .social-btn:hover {
            background: #f9fafb;
          }

          .social-btn img {
            width: 18px;
            height: 18px;
          }

          .auth-footer {
            text-align: center;
            font-size: 14px;
            color: #6b7280;
          }

          .auth-footer a {
            color: #2563eb;
            font-weight: 500;
          }
        `}</style>
      </div>
    </>
  );
}

export default LoginPage;
