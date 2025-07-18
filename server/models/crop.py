from datetime import datetime
import uuid
from sqlalchemy.dialects.postgresql import UUID

from server.database import db

class Crop(db.Model):
    """Crop model for agricultural context."""
    __tablename__ = 'crops'
    
    crop_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    scientific_name = db.Column(db.String(100), nullable=True)
    category = db.Column(db.String(50), nullable=True)  # cereal, vegetable, fruit, legume, etc.
    growing_season = db.Column(db.String(50), nullable=True)  # spring, summer, fall, winter, year-round
    climate_requirements = db.Column(db.Text, nullable=True)
    water_requirements = db.Column(db.String(50), nullable=True)  # low, medium, high
    soil_type = db.Column(db.String(100), nullable=True)
    maturity_days = db.Column(db.Integer, nullable=True)  # days to harvest
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert crop to dictionary."""
        return {
            'crop_id': self.crop_id,
            'name': self.name,
            'scientific_name': self.scientific_name,
            'category': self.category,
            'growing_season': self.growing_season,
            'climate_requirements': self.climate_requirements,
            'water_requirements': self.water_requirements,
            'soil_type': self.soil_type,
            'maturity_days': self.maturity_days
        }


class Livestock(db.Model):
    """Livestock model for agricultural context."""
    __tablename__ = 'livestock'
    
    livestock_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=True)  # cattle, poultry, goat, sheep, pig, etc.
    breed = db.Column(db.String(100), nullable=True)
    purpose = db.Column(db.String(100), nullable=True)  # meat, dairy, eggs, wool, etc.
    climate_suitability = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert livestock to dictionary."""
        return {
            'livestock_id': self.livestock_id,
            'name': self.name,
            'category': self.category,
            'breed': self.breed,
            'purpose': self.purpose,
            'climate_suitability': self.climate_suitability
        }


class UserCrop(db.Model):
    """User crop relationship for farmer's crops."""
    __tablename__ = 'user_crops'
    
    user_crop_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.crop_id'), nullable=False)
    area_planted = db.Column(db.Numeric(10, 2), nullable=True)  # in hectares or acres
    area_unit = db.Column(db.String(10), default='hectares')
    planting_date = db.Column(db.Date, nullable=True)
    expected_harvest = db.Column(db.Date, nullable=True)
    actual_harvest = db.Column(db.Date, nullable=True)
    yield_amount = db.Column(db.Numeric(10, 2), nullable=True)  # in kg or tons
    yield_unit = db.Column(db.String(10), default='kg')
    notes = db.Column(db.Text, nullable=True)
    season = db.Column(db.String(20), nullable=True)  # spring2024, summer2024, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('crops', lazy=True))
    crop = db.relationship('Crop', backref=db.backref('user_crops', lazy=True))
    
    def to_dict(self):
        """Convert user crop to dictionary."""
        return {
            'user_crop_id': str(self.user_crop_id),
            'crop': self.crop.to_dict() if self.crop else None,
            'area_planted': float(self.area_planted) if self.area_planted else None,
            'area_unit': self.area_unit,
            'planting_date': self.planting_date.isoformat() if self.planting_date else None,
            'expected_harvest': self.expected_harvest.isoformat() if self.expected_harvest else None,
            'actual_harvest': self.actual_harvest.isoformat() if self.actual_harvest else None,
            'yield_amount': float(self.yield_amount) if self.yield_amount else None,
            'yield_unit': self.yield_unit,
            'notes': self.notes,
            'season': self.season
        }