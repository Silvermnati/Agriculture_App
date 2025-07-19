from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from server.database import db

class ExpertProfile(db.Model):
    """Expert profile model for agricultural experts."""
    __tablename__ = 'expert_profiles'
    
    profile_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False, unique=True)
    title = db.Column(db.String(100), nullable=False)  # Agricultural Scientist, Agronomist, etc.
    specializations = db.Column(ARRAY(db.String), nullable=False)  # Array of specializations
    certification = db.Column(db.String(255), nullable=True)
    education = db.Column(db.String(255), nullable=True)
    years_experience = db.Column(db.Integer, nullable=False)
    hourly_rate = db.Column(db.Numeric(10, 2), nullable=True)
    currency = db.Column(db.String(3), default='USD')
    availability_status = db.Column(db.String(20), default='available')  # available, busy, unavailable
    languages_spoken = db.Column(ARRAY(db.String), nullable=True)
    service_areas = db.Column(ARRAY(db.Integer), nullable=True)  # Array of location_ids
    rating = db.Column(db.Numeric(3, 2), nullable=True)
    review_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('expert_profile', uselist=False, lazy=True))
    
    def to_dict(self):
        """Convert expert profile to dictionary."""
        return {
            'profile_id': str(self.profile_id),
            'user': {
                'user_id': str(self.user.user_id),
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'avatar_url': self.user.avatar_url,
                'bio': self.user.bio
            } if self.user else None,
            'title': self.title,
            'specializations': self.specializations,
            'certification': self.certification,
            'education': self.education,
            'years_experience': self.years_experience,
            'hourly_rate': float(self.hourly_rate) if self.hourly_rate else None,
            'currency': self.currency,
            'availability_status': self.availability_status,
            'languages_spoken': self.languages_spoken,
            'service_areas': self.service_areas,
            'rating': float(self.rating) if self.rating else None,
            'review_count': self.review_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Consultation(db.Model):
    """Consultation model for expert consultations."""
    __tablename__ = 'consultations'
    
    consultation_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    farmer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    consultation_type = db.Column(db.String(20), nullable=False)  # video, chat, field_visit
    scheduled_start = db.Column(db.DateTime, nullable=False)
    scheduled_end = db.Column(db.DateTime, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    related_crops = db.Column(ARRAY(db.Integer), nullable=True)  # Array of crop_ids
    farm_location_id = db.Column(db.Integer, db.ForeignKey('locations.location_id'), nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')  # unpaid, paid, refunded
    amount = db.Column(db.Numeric(10, 2), nullable=True)
    currency = db.Column(db.String(3), default='USD')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    expert = db.relationship('User', foreign_keys=[expert_id], backref=db.backref('expert_consultations', lazy=True))
    farmer = db.relationship('User', foreign_keys=[farmer_id], backref=db.backref('farmer_consultations', lazy=True))
    farm_location = db.relationship('Location', backref=db.backref('consultations', lazy=True))
    
    def to_dict(self):
        """Convert consultation to dictionary."""
        return {
            'consultation_id': str(self.consultation_id),
            'expert': {
                'user_id': str(self.expert.user_id),
                'name': f"{self.expert.first_name} {self.expert.last_name}",
                'avatar_url': self.expert.avatar_url
            } if self.expert else None,
            'farmer': {
                'user_id': str(self.farmer.user_id),
                'name': f"{self.farmer.first_name} {self.farmer.last_name}",
                'avatar_url': self.farmer.avatar_url
            } if self.farmer else None,
            'consultation_type': self.consultation_type,
            'scheduled_start': self.scheduled_start.isoformat(),
            'scheduled_end': self.scheduled_end.isoformat(),
            'topic': self.topic,
            'description': self.description,
            'related_crops': self.related_crops,
            'farm_location_id': self.farm_location_id,
            'status': self.status,
            'payment_status': self.payment_status,
            'amount': float(self.amount) if self.amount else None,
            'currency': self.currency,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ExpertReview(db.Model):
    """Expert review model."""
    __tablename__ = 'expert_reviews'
    
    review_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expert_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    reviewer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    consultation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('consultations.consultation_id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    expert = db.relationship('User', foreign_keys=[expert_id], backref=db.backref('received_reviews', lazy=True))
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref=db.backref('given_reviews', lazy=True))
    consultation = db.relationship('Consultation', backref=db.backref('review', uselist=False, lazy=True))
    
    def to_dict(self):
        """Convert expert review to dictionary."""
        return {
            'review_id': str(self.review_id),
            'expert_id': str(self.expert_id),
            'reviewer': {
                'user_id': str(self.reviewer.user_id),
                'name': f"{self.reviewer.first_name} {self.reviewer.last_name}",
                'avatar_url': self.reviewer.avatar_url
            } if self.reviewer else None,
            'consultation_id': str(self.consultation_id) if self.consultation_id else None,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }