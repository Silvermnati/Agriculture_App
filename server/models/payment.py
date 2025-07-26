from datetime import datetime
import uuid
from decimal import Decimal
from sqlalchemy.dialects.postgresql import UUID
from server.database import db


class Payment(db.Model):
    """Payment model for M-Pesa transactions."""
    __tablename__ = 'payments'
    
    payment_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    consultation_id = db.Column(UUID(as_uuid=True), nullable=True)  # Can be null for other payment types
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='KES', nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    mpesa_receipt_number = db.Column(db.String(50), nullable=True)
    checkout_request_id = db.Column(db.String(50), nullable=True)
    merchant_request_id = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, completed, failed, cancelled, refunded
    payment_type = db.Column(db.String(50), default='consultation', nullable=False)  # consultation, premium_feature, etc.
    description = db.Column(db.String(255), nullable=True)
    failure_reason = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('payments', lazy=True))
    
    def to_dict(self):
        """Convert payment to dictionary."""
        return {
            'payment_id': str(self.payment_id),
            'consultation_id': str(self.consultation_id) if self.consultation_id else None,
            'user_id': str(self.user_id),
            'amount': float(self.amount),
            'currency': self.currency,
            'phone_number': self.phone_number,
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'checkout_request_id': self.checkout_request_id,
            'merchant_request_id': self.merchant_request_id,
            'status': self.status,
            'payment_type': self.payment_type,
            'description': self.description,
            'failure_reason': self.failure_reason,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def __repr__(self):
        return f'<Payment {self.payment_id} - {self.status}>'


class TransactionLog(db.Model):
    """Transaction log for M-Pesa API interactions."""
    __tablename__ = 'transaction_logs'
    
    log_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('payments.payment_id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # stk_push, callback, query, refund
    request_data = db.Column(db.JSON, nullable=True)
    response_data = db.Column(db.JSON, nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    payment = db.relationship('Payment', backref=db.backref('transaction_logs', lazy=True))
    
    def to_dict(self):
        """Convert transaction log to dictionary."""
        return {
            'log_id': str(self.log_id),
            'payment_id': str(self.payment_id),
            'transaction_type': self.transaction_type,
            'request_data': self.request_data,
            'response_data': self.response_data,
            'status_code': self.status_code,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<TransactionLog {self.log_id} - {self.transaction_type}>'