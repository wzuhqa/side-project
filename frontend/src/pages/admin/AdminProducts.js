import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 100 });
      setProducts(response.data.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Products - Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="page-header">
          <h1>Products</h1>
          <button className="btn btn-primary">
            <FiPlus size={18} />
            Add Product
          </button>
        </div>

        <div className="search-bar">
          <FiSearch size={20} />
          <input
            type="text"
            placeholder="Search products..."
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
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.images?.[0]?.url || '/placeholder.jpg'} 
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>${product.price?.toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn edit">
                          <FiEdit size={16} />
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
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

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }

          .page-header h1 {
            font-size: 28px;
            font-weight: 700;
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

          .product-thumb {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 8px;
          }

          .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }

          .status-badge.active { background: #d1fae5; color: #10b981; }
          .status-badge.draft { background: #f3f4f6; color: #6b7280; }

          .actions {
            display: flex;
            gap: 8px;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .action-btn.edit {
            background: #eff6ff;
            color: #2563eb;
          }

          .action-btn.delete {
            background: #fef2f2;
            color: #ef4444;
          }
        `}</style>
      </div>
    </>
  );
}

export default AdminProducts;
