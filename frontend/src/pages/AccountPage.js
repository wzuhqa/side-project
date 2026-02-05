import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiMapPin, FiHeart, FiCreditCard, FiBell, FiLock, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

function AccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(profileData);
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>My Account - ShopNow</title>
      </Helmet>

      <div className="account-page">
        <div className="container">
          <div className="account-layout">
            {/* Sidebar */}
            <aside className="account-sidebar">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="user-name">{user?.firstName} {user?.lastName}</p>
                  <p className="user-email">{user?.email}</p>
                </div>
              </div>

              <nav className="account-nav">
                <button 
                  className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <FiUser size={20} />
                  Profile
                </button>
                <button 
                  className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <FiMapPin size={20} />
                  Addresses
                </button>
                <Link to="/account/orders" className="nav-item">
                  <FiCreditCard size={20} />
                  Orders
                </Link>
                <Link to="/account/wishlist" className="nav-item">
                  <FiHeart size={20} />
                  Wishlist
                </Link>
                <button 
                  className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <FiLock size={20} />
                  Change Password
                </button>
                <button className="nav-item logout" onClick={logout}>
                  <FiLogOut size={20} />
                  Logout
                </button>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="account-content">
              {activeTab === 'profile' && (
                <div className="content-section">
                  <h2>Profile Information</h2>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={user?.email || ''} disabled />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="content-section">
                  <h2>My Addresses</h2>
                  <div className="addresses-grid">
                    <div className="address-card add-new">
                      <span>+</span>
                      <p>Add New Address</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="content-section">
                  <h2>Change Password</h2>
                  <form>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input type="password" />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input type="password" />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </main>
          </div>
        </div>

        <style jsx>{`
          .account-page {
            padding: 40px 0;
            background: #f9fafb;
            min-height: 80vh;
          }

          .account-layout {
            display: grid;
            grid-template-columns: 280px 1fr;
            gap: 32px;
          }

          .account-sidebar {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            height: fit-content;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-bottom: 24px;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 24px;
          }

          .user-avatar {
            width: 56px;
            height: 56px;
            background: #2563eb;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 600;
          }

          .user-name {
            font-weight: 600;
            margin-bottom: 4px;
          }

          .user-email {
            font-size: 14px;
            color: #6b7280;
          }

          .account-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 8px;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.2s;
            text-align: left;
          }

          .nav-item:hover,
          .nav-item.active {
            background: #eff6ff;
            color: #2563eb;
          }

          .nav-item.logout {
            color: #ef4444;
            margin-top: 24px;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
          }

          .account-content {
            background: #fff;
            border-radius: 12px;
            padding: 32px;
          }

          .content-section h2 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 24px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
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

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }

          .form-group input:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
          }

          .addresses-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .address-card {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
          }

          .address-card.add-new {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            border-style: dashed;
            min-height: 150px;
            color: #6b7280;
          }

          .address-card.add-new span {
            font-size: 32px;
            color: #2563eb;
          }

          @media (max-width: 768px) {
            .account-layout {
              grid-template-columns: 1fr;
            }

            .addresses-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default AccountPage;
