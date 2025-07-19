from datetime import datetime
from server.database import db

class Country(db.Model):
    """Country model for location hierarchy."""
    __tablename__ = 'countries'
    
    country_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(3), nullable=False, unique=True)  # ISO country code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    states = db.relationship('StateProvince', backref='country', lazy=True)
    
    def to_dict(self):
        """Convert country to dictionary."""
        return {
            'country_id': self.country_id,
            'name': self.name,
            'code': self.code
        }


class StateProvince(db.Model):
    """State/Province model for location hierarchy."""
    __tablename__ = 'states_provinces'
    
    state_id = db.Column(db.Integer, primary_key=True)
    country_id = db.Column(db.Integer, db.ForeignKey('countries.country_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    locations = db.relationship('Location', backref='state', lazy=True)
    
    def to_dict(self):
        """Convert state to dictionary."""
        return {
            'state_id': self.state_id,
            'country_id': self.country_id,
            'name': self.name,
            'code': self.code
        }


class Location(db.Model):
    """Location model with agricultural context."""
    __tablename__ = 'locations'
    
    location_id = db.Column(db.Integer, primary_key=True)
    country_id = db.Column(db.Integer, db.ForeignKey('countries.country_id'), nullable=False)
    state_id = db.Column(db.Integer, db.ForeignKey('states_provinces.state_id'), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Numeric(10, 8), nullable=True)
    longitude = db.Column(db.Numeric(11, 8), nullable=True)
    climate_zone = db.Column(db.String(50), nullable=True)  # tropical, temperate, arid, etc.
    elevation = db.Column(db.Integer, nullable=True)  # meters above sea level
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    country = db.relationship('Country', backref='locations')
    users = db.relationship('User', backref='location', lazy=True)
    
    def to_dict(self):
        """Convert location to dictionary."""
        return {
            'location_id': self.location_id,
            'country': self.country.name if self.country else None,
            'state': self.state.name if self.state else None,
            'city': self.city,
            'climate_zone': self.climate_zone,
            'coordinates': {
                'latitude': float(self.latitude) if self.latitude else None,
                'longitude': float(self.longitude) if self.longitude else None
            } if self.latitude and self.longitude else None
        }