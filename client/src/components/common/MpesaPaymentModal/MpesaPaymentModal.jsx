import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../../utils/api';
import './MpesaPaymentModal.css';

const MpesaPaymentModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  currency = 'KES',
  description,
  consultationId,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, pending, processing, success, failed
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  useEffect(() => {
    if (paymentStatus === 'processing' && checkoutRequestId) {
      const interval = setInterval(async () => {
        try {
          const response = await paymentsAPI.getPaymentStatus(paymentId);
          const { status } = response.data;
          
          if (status === 'completed') {
            setPaymentStatus('success');
            clearInterval(interval);
            if (onPaymentSuccess) {
              onPaymentSuccess(response.data);
            }
          } else if (status === 'failed' || status === 'cancelled') {
            setPaymentStatus('failed');
            setError('Payment was not completed. Please try again.');
            clearInterval(interval);
            if (onPaymentError) {
              onPaymentError(new Error('Payment failed'));
            }
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 3000); // Check every 3 seconds

      setStatusCheckInterval(interval);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          if (paymentStatus === 'processing') {
            setPaymentStatus('failed');
            setError('Payment timeout. Please try again.');
          }
        }
      }, 300000); // 5 minutes

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [paymentStatus, checkoutRequestId, paymentId, onPaymentSuccess, onPaymentError]);

  const handleClose = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    setPhoneNumber('');
    setPaymentStatus('idle');
    setError('');
    setPaymentId(null);
    setCheckoutRequestId(null);
    onClose();
  };

  const validatePhoneNumber = (phone) => {
    // Kenyan phone number validation
    const phoneRegex = /^(254|0)?[17]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const formatPhoneNumber = (phone) => {
    // Convert to international format
    let formatted = phone.replace(/\s+/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    } else if (!formatted.startsWith('254')) {
      formatted = '254' + formatted;
    }
    return formatted;
  };

  const handlePayment = async () => {
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setPaymentStatus('pending');

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const paymentData = {
        phone_number: formattedPhone,
        amount: parseFloat(amount),
        currency,
        description,
        consultation_id: consultationId,
        payment_type: consultationId ? 'consultation' : 'general'
      };

      console.log('Initiating M-Pesa payment with data:', paymentData);

      // Use consultation payment endpoint if consultationId is provided
      const response = consultationId 
        ? await paymentsAPI.initiateConsultationPayment(paymentData)
        : await paymentsAPI.initiatePayment(paymentData);
      
      console.log('M-Pesa payment response:', response.data);
      
      const { payment_id, checkout_request_id } = response.data;

      setPaymentId(payment_id);
      setCheckoutRequestId(checkout_request_id);
      setPaymentStatus('processing');
    } catch (err) {
      console.error('Payment initiation error:', err);
      console.error('Error response:', err.response?.data);
      
      setPaymentStatus('failed');
      
      // Provide more detailed error messages
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      if (err.response?.data?.error) {
        // Handle both string and object error formats
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error.message) {
          errorMessage = err.response.data.error.message;
        } else {
          errorMessage = JSON.stringify(err.response.data.error);
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Ensure errorMessage is a string before using string methods
      const errorString = String(errorMessage);
      
      // Handle specific error cases
      if (errorString.includes('MISSING_CREDENTIALS')) {
        errorMessage = 'M-Pesa service is not properly configured. Please contact support.';
      } else if (errorString.includes('Invalid phone number')) {
        errorMessage = 'Please enter a valid Kenyan phone number (e.g., 0712345678)';
      } else if (errorString.includes('TOKEN_ERROR')) {
        errorMessage = 'M-Pesa service is temporarily unavailable. Please try again later.';
      } else if (errorString.includes('500')) {
        errorMessage = 'M-Pesa service is temporarily unavailable. Please try again later.';
      }
      
      setError(errorMessage);
      
      if (onPaymentError) {
        onPaymentError(err);
      }
    }
  };

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'pending':
        return {
          className: 'pending',
          icon: '⏳',
          message: 'Initiating payment...'
        };
      case 'processing':
        return {
          className: 'processing',
          icon: <div className="loading-spinner"></div>,
          message: 'Check your phone for M-Pesa prompt and enter your PIN'
        };
      case 'success':
        return {
          className: 'success',
          icon: '✅',
          message: 'Payment completed successfully!'
        };
      case 'failed':
        return {
          className: 'failed',
          icon: '❌',
          message: 'Payment failed'
        };
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const statusDisplay = getStatusDisplay();

  return (
    <div className="mpesa-payment-modal" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="mpesa-payment-content">
        <div className="mpesa-payment-header">
          <div className="mpesa-payment-title">
            <div className="mpesa-logo">M</div>
            M-Pesa Payment
          </div>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="amount-display">
          <div className="amount-label">Amount to Pay</div>
          <div className="amount-value">
            {currency} {parseFloat(amount).toLocaleString()}
          </div>
        </div>

        {description && (
          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Description:</span>
              <span className="detail-value">{description}</span>
            </div>
          </div>
        )}

        {statusDisplay && (
          <div className={`payment-status ${statusDisplay.className}`}>
            <span className="status-icon">{statusDisplay.icon}</span>
            {statusDisplay.message}
          </div>
        )}

        {paymentStatus === 'idle' && (
          <>
            <div className="payment-form">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="phone-input-group">
                  <div className="country-code">+254</div>
                  <input
                    type="tel"
                    className="form-input phone-input"
                    placeholder="712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={paymentStatus !== 'idle'}
                  />
                </div>
              </div>
            </div>

            <div className="payment-instructions">
              <div className="instructions-title">How to pay:</div>
              <ul className="instructions-list">
                <li>Enter your M-Pesa registered phone number</li>
                <li>Click "Pay Now&quot; to initiate payment</li>
                <li>Check your phone for M-Pesa prompt</li>
                <li>Enter your M-Pesa PIN to complete payment</li>
              </ul>
            </div>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="payment-instructions">
            <div className="instructions-title">Complete your payment:</div>
            <ul className="instructions-list">
              <li>Check your phone for the M-Pesa payment prompt</li>
              <li>Enter your M-Pesa PIN to authorize the payment</li>
              <li>Wait for confirmation message</li>
              <li>Do not close this window until payment is complete</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          {paymentStatus === 'idle' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleClose}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handlePayment}
                disabled={!phoneNumber.trim()}
              >
                Pay Now
              </button>
            </>
          )}
          
          {paymentStatus === 'processing' && (
            <button 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Cancel Payment
            </button>
          )}
          
          {(paymentStatus === 'success' || paymentStatus === 'failed') && (
            <button 
              className="btn btn-primary" 
              onClick={handleClose}
            >
              {paymentStatus === 'success' ? 'Continue' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MpesaPaymentModal;