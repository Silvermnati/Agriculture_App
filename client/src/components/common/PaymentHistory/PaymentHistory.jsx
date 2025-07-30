import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../../utils/api';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await paymentsAPI.getPaymentHistory(params);
      const { payments: paymentData, total, page, limit } = response.data;

      setPayments(paymentData || []);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / limit),
        page
      }));
      setError('');
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Failed to load payment history');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⚪';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const handleDownloadReceipt = (payment) => {
    setSelectedReceipt(payment);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleRequestRefund = async (paymentId) => {
    try {
      const reason = prompt('Please provide a reason for the refund request:');
      if (!reason) return;

      await paymentsAPI.requestRefund(paymentId, { reason });
      alert('Refund request submitted successfully');
      fetchPayments(); // Refresh the list
    } catch (err) {
      console.error('Error requesting refund:', err);
      alert('Failed to submit refund request');
    }
  };

  const canRequestRefund = (payment) => {
    return payment.status === 'completed' && 
           new Date() - new Date(payment.created_at) < 7 * 24 * 60 * 60 * 1000; // 7 days
  };

  const ReceiptModal = ({ payment, onClose }) => {
    if (!payment) return null;

    return (
      <div className="receipt-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="receipt-content">
          <div className="receipt-header">
            <h2 className="receipt-title">Payment Receipt</h2>
            <p className="receipt-subtitle">Transaction ID: {payment.payment_id}</p>
          </div>

          <div className="receipt-details">
            <div className="receipt-row">
              <span className="receipt-label">Date & Time:</span>
              <span className="receipt-value">{formatDate(payment.created_at)}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Description:</span>
              <span className="receipt-value">{payment.description}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Phone Number:</span>
              <span className="receipt-value">{payment.phone_number}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">M-Pesa Receipt:</span>
              <span className="receipt-value">{payment.mpesa_receipt_number || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Status:</span>
              <span className="receipt-value">
                <span className={`payment-status ${payment.status}`}>
                  {getStatusIcon(payment.status)} {payment.status}
                </span>
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Total Amount:</span>
              <span className="receipt-value">{formatCurrency(payment.amount, payment.currency)}</span>
            </div>
          </div>

          <div className="receipt-actions">
            <button className="receipt-btn secondary" onClick={onClose}>
              Close
            </button>
            <button className="receipt-btn primary" onClick={handlePrintReceipt}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Print Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="payment-history">
      <div className="payment-history-header">
        <h2 className="payment-history-title">Payment History</h2>
        
        <div className="payment-filters">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select 
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Type</label>
            <select 
              className="filter-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="premium">Premium Features</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <div className="date-range-inputs">
              <input
                type="date"
                className="date-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                placeholder="From"
              />
              <span>to</span>
              <input
                type="date"
                className="date-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="payment-list">
        {loading ? (
          <div className="loading-payments">
            <div className="loading-spinner"></div>
            <div>Loading payment history...</div>
          </div>
        ) : error ? (
          <div className="empty-payments">
            <svg className="empty-payments-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="empty-payments-title">Error Loading Payments</div>
            <div className="empty-payments-message">{error}</div>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-payments">
            <svg className="empty-payments-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="empty-payments-title">No Payments Found</div>
            <div className="empty-payments-message">
              You haven't made any payments yet. Your payment history will appear here once you make your first transaction.
            </div>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.payment_id} className="payment-item">
              <div className="payment-item-header">
                <div className="payment-description">{payment.description}</div>
                <div className={`payment-amount ${payment.amount >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(Math.abs(payment.amount), payment.currency)}
                </div>
              </div>

              <div className="payment-item-details">
                <div className="payment-detail">
                  <span className="payment-detail-label">Date</span>
                  <span className="payment-detail-value">{formatDate(payment.created_at)}</span>
                </div>
                <div className="payment-detail">
                  <span className="payment-detail-label">Status</span>
                  <span className="payment-detail-value">
                    <span className={`payment-status ${payment.status}`}>
                      {getStatusIcon(payment.status)} {payment.status}
                    </span>
                  </span>
                </div>
                <div className="payment-detail">
                  <span className="payment-detail-label">Phone</span>
                  <span className="payment-detail-value">{payment.phone_number}</span>
                </div>
                {payment.mpesa_receipt_number && (
                  <div className="payment-detail">
                    <span className="payment-detail-label">M-Pesa Receipt</span>
                    <span className="payment-detail-value">{payment.mpesa_receipt_number}</span>
                  </div>
                )}
              </div>

              <div className="payment-actions">
                <button 
                  className="payment-action-btn"
                  onClick={() => handleDownloadReceipt(payment)}
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Receipt
                </button>
                
                {canRequestRefund(payment) && (
                  <button 
                    className="payment-action-btn"
                    onClick={() => handleRequestRefund(payment.payment_id)}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Request Refund
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {payments.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
          </div>
          
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + Math.max(1, pagination.page - 2);
              if (page > pagination.totalPages) return null;
              
              return (
                <button
                  key={page}
                  className={`pagination-btn ${page === pagination.page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ReceiptModal 
        payment={selectedReceipt} 
        onClose={() => setSelectedReceipt(null)} 
      />
    </div>
  );
};

export default PaymentHistory;