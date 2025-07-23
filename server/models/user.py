from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.database import db

class User(db.Model):
    """User model with agricultural fields."""
    __tablename__ = 'users'
    
    # Core fields
    user_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # farmer, expert, supplier, researcher, student, admin
    bio = db.Column(db.Text)
    
    # Agricultural fields
    location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'), nullable=True)
    farm_size = db.Column(db.Numeric(10, 2), nullable=True)  # in hectares
    farm_size_unit = db.Column(db.String(10), default='hectares')
    farming_experience = db.Column(db.Integer, nullable=True)  # years
    farming_type = db.Column(db.String(50), nullable=True)  # organic, conventional, mixed
    primary_language = db.Column(db.String(10), default='en')
    
    # Media fields
    avatar_url = db.Column(db.String(255), nullable=True)
    cover_image_url = db.Column(db.String(255), nullable=True)
    
    # Contact fields
    phone_number = db.Column(db.String(20), nullable=True)
    whatsapp_number = db.Column(db.String(20), nullable=True)
    is_phone_verified = db.Column(db.Boolean, default=False)
    
    # Simple location fields (alternative to complex location hierarchy)
    country = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    
    # Status fields
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, email, password, first_name, last_name, role, **kwargs):
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
        
        # Set optional fields from kwargs
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def check_password(self, password):
        """Check if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary."""
        return {
            'user_id': str(self.user_id),
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'phone_number': self.phone_number,
            'country': self.country,
            'city': self.city,
            'farm_size': float(self.farm_size) if self.farm_size else None,
            'farm_size_unit': self.farm_size_unit,
            'farming_experience': self.farming_experience,
            'farming_type': self.farming_type,
            'is_verified': self.is_verified,
            'join_date': self.join_date.isoformat() if self.join_date else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.email}>'


class UserExpertise(db.Model):
    """User expertise model for tracking agricultural skills."""
    __tablename__ = 'user_expertise'
    
    expertise_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    expertise = db.Column(db.String(100), nullable=False)
    years_experience = db.Column(db.Integer, nullable=True)
    certification = db.Column(db.String(255), nullable=True)
    institution = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', backref=db.backref('expertise', lazy=True))
    
    def to_dict(self):
        """Convert expertise to dictionary."""
        return {
            'expertise_id': self.expertise_id,
            'expertise': self.expertise,
            'years_experience': self.years_experience,
            'certification': self.certification,
            'institution': self.institution
        }


class UserFollow(db.Model):
    """User follow relationship for expert following."""
    __tablename__ = 'user_follows'
    
    follow_id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    following_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref=db.backref('following', lazy=True))
    following = db.relationship('User', foreign_keys=[following_id], backref=db.backref('followers', lazy=True))
    
    __table_args__ = (
        db.UniqueConstraint('follower_id', 'following_id', name='unique_follow'),
    )