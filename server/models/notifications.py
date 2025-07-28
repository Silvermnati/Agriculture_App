from datetime import datetime, time
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from server.database import db


class Notification(db.Model):
    """Notification model for multi-channel notifications."""
    __tablename__ = 'notifications'
    
    notification_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # payment_confirmation, new_comment, consultation_booked, etc.
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    data = db.Column(db.JSON, nullable=True)  # Additional context data
    channels = db.Column(ARRAY(db.String), default=['in_app'], nullable=False)  # ['push', 'email', 'sms', 'in_app']
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, sent, failed, read
    priority = db.Column(db.String(10), default='normal', nullable=False)  # low, normal, high, urgent
    scheduled_at = db.Column(db.DateTime, nullable=True)
    sent_at = db.Column(db.DateTime, nullable=True)
    read_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('notifications', lazy=True))
    
    def to_dict(self):
        """Convert notification to dictionary."""
        return {
            'notification_id': str(self.notification_id),
            'user_id': str(self.user_id),
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'data': self.data,
            'channels': self.channels,
            'status': self.status,
            'priority': self.priority,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Notification {self.notification_id} - {self.type}>'


class NotificationPreferences(db.Model):
    """User notification preferences."""
    __tablename__ = 'notification_preferences'
    
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), primary_key=True)
    email_notifications = db.Column(db.Boolean, default=True, nullable=False)
    push_notifications = db.Column(db.Boolean, default=True, nullable=False)
    sms_notifications = db.Column(db.Boolean, default=False, nullable=False)
    in_app_notifications = db.Column(db.Boolean, default=True, nullable=False)
    notification_types = db.Column(db.JSON, default={}, nullable=False)  # Specific type preferences
    quiet_hours_start = db.Column(db.Time, nullable=True)
    quiet_hours_end = db.Column(db.Time, nullable=True)
    timezone = db.Column(db.String(50), default='UTC', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('notification_preferences', uselist=False))
    
    def to_dict(self):
        """Convert notification preferences to dictionary."""
        return {
            'user_id': str(self.user_id),
            'email_notifications': self.email_notifications,
            'push_notifications': self.push_notifications,
            'sms_notifications': self.sms_notifications,
            'in_app_notifications': self.in_app_notifications,
            'notification_types': self.notification_types,
            'quiet_hours_start': self.quiet_hours_start.isoformat() if self.quiet_hours_start else None,
            'quiet_hours_end': self.quiet_hours_end.isoformat() if self.quiet_hours_end else None,
            'timezone': self.timezone,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<NotificationPreferences {self.user_id}>'


class NotificationDelivery(db.Model):
    """Notification delivery tracking."""
    __tablename__ = 'notification_deliveries'
    
    delivery_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = db.Column(UUID(as_uuid=True), db.ForeignKey('notifications.notification_id'), nullable=False)
    channel = db.Column(db.String(20), nullable=False)  # push, email, sms, in_app
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, sent, delivered, failed
    provider_response = db.Column(db.JSON, nullable=True)
    attempts = db.Column(db.Integer, default=0, nullable=False)
    max_attempts = db.Column(db.Integer, default=3, nullable=False)
    last_attempt_at = db.Column(db.DateTime, nullable=True)
    delivered_at = db.Column(db.DateTime, nullable=True)
    failed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    notification = db.relationship('Notification', backref=db.backref('deliveries', lazy=True))
    
    def to_dict(self):
        """Convert notification delivery to dictionary."""
        return {
            'delivery_id': str(self.delivery_id),
            'notification_id': str(self.notification_id),
            'channel': self.channel,
            'status': self.status,
            'provider_response': self.provider_response,
            'attempts': self.attempts,
            'max_attempts': self.max_attempts,
            'last_attempt_at': self.last_attempt_at.isoformat() if self.last_attempt_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<NotificationDelivery {self.delivery_id} - {self.channel}>'