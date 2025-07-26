from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID
from server.database import db

class Notification(db.Model):
    """Notification model."""
    __tablename__ = 'notifications'

    notification_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)  
    post_id = db.Column(UUID(as_uuid=True), db.ForeignKey('posts.post_id'), nullable=False)  
    type = db.Column(db.String(50), nullable=False)  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref=db.backref('notifications', lazy=True))
    post = db.relationship('Post', backref=db.backref('notifications', lazy=True))

    def to_dict(self):
        return {
            'notification_id': str(self.notification_id),
            'type': self.type,
            'is_read': self.is_read,
        }