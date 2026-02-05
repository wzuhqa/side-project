import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiMail, FiCalendar } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulated customer data for demo
    setCustomers([
      { _id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', createdAt: new Date().toISOString(), ordersCount: 5, totalSpent: 1250.00 },
      { _id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', createdAt: new Date().toISOString(), ordersCount: 3, totalSpent: 450.00 },
      { _id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', createdAt: new Date().toISOString(), ordersCount: 8, totalSpent: 2100.00 },
    ]);
    setLoading(false);
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Customers - Admin</title>
      </Helmet>

      <div className="admin-page">
        <h1 className="page-title">Customers</h1>

        <div className="search-bar">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer._id}>
                    <td className="customer-name">
                      <div className="avatar">
                        {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                      </div>
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td>{customer.email}</td>
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>{customer.ordersCount}</td>
                    <td className="spent">${customer.totalSpent?.toFixed(2)}</td>
                    <td>
                      <button className="action-btn">
                        <FiMail size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <style jsx>{`
          .admin-page {
            padding: 24px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 24px;
          }

          .search-bar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 24px;
          }

          .search-bar input {
            flex: 1;
            border: none;
            outline: none;
          }

          .loading {
            display: flex;
            justify-content: center;
            padding: 60px;
          }

          .table-container {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .admin-table {
            width: 100%;
            border-collapse: collapse;
          }

          .admin-table th,
          .admin-table td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }

          .admin-table th {
            background: #f9fafb;
            font-weight: 600;
            font-size: 14px;
          }

          .customer-name {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .avatar {
            width: 36px;
            height: 36px;
            background: #2563eb;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          .spent {
            font-weight: 600;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 6px;
          }
        `}</style>
      </div>
    </>
  );
}

export default AdminCustomers;
