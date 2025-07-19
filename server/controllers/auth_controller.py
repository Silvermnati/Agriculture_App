from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash
import uuid
import jwt
from datetime import datetime, timedelta

from server.models.user import User
from server.models.location import Location
from server.database import db
from server.utils.auth import token_required

def register():
    """
    Register a new user with agricultural profile data.
    
    Request Body:
    {
        "email": "farmer@example.com",
        "password": "securepassword",
        "first_name": "John",
        "last_name": "Farmer",
        "role": "farmer",
        "location": {
            "country_id": 1,
            "state_id": 5,
            "city": "Farmville"
        },
        "farm_size": 25.5,
        "farm_size_unit": "hectares",
        "farming_experience": 10,
        "farming_type": "organic"
    }
    """
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'User already exists'}), 409
    
    # Create location if provided
    location_id = None
    if 'location' in data:
        location_data = data['location']
        location = Location(
            country_id=location_data.get('country_id'),
            state_id=location_data.get('state_id'),
            city=location_data.get('city')
        )
        db.session.add(location)
        db.session.flush()  # Get the ID without committing
        location_id = location.location_id
    
    # Create user
    user = User(
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        role=data.get('role', 'farmer'),
        location_id=location_id,
        farm_size=data.get('farm_size'),
        farm_size_unit=data.get('farm_size_unit', 'hectares'),
        farming_experience=data.get('farming_experience'),
        farming_type=data.get('farming_type')
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = jwt.encode({
        'user_id': str(user.user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': user.to_dict()
    }), 201


def login():
    """
    Authenticate user and return token.
    
    Request Body:
    {
        "email": "farmer@example.com",
        "password": "securepassword"
    }
    """
    auth = request.get_json()
    
    if not auth or not auth.get('email') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    
    user = User.query.filter_by(email=auth.get('email')).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if not user.check_password(auth.get('password')):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate token
    token = jwt.encode({
        'user_id': str(user.user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@token_required
def get_profile(current_user):
    """
    Get current user profile with agricultural data.
    """
    user = User.query.get(current_user.user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get user profile with related data
    user_data = user.to_dict()
    
    # Add location data if available
    if user.location:
        user_data['location'] = user.location.to_dict()
    
    # Add crops data if available
    if hasattr(user, 'crops'):
        user_data['crops'] = [crop.to_dict() for crop in user.crops]
    
    # Add expertise data if available
    if hasattr(user, 'expertise'):
        user_data['expertise'] = [exp.to_dict() for exp in user.expertise]
    
    return jsonify(user_data), 200


@token_required
def update_profile(current_user):
    """
    Update user profile with agricultural information.
    
    Request Body:
    {
        "first_name": "John",
        "last_name": "Farmer",
        "farm_size": 30.5,
        "farming_experience": 12,
        "farming_type": "organic",
        "location": {
            "country_id": 1,
            "state_id": 5,
            "city": "Farmville"
        }
    }
    """
    data = request.get_json()
    user = User.query.get(current_user.user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Update basic fields
    for field in ['first_name', 'last_name', 'bio', 'farm_size', 
                 'farm_size_unit', 'farming_experience', 'farming_type',
                 'phone_number', 'whatsapp_number']:
        if field in data:
            setattr(user, field, data[field])
    
    # Update location if provided
    if 'location' in data:
        location_data = data['location']
        
        # Create new location or update existing
        if user.location_id:
            location = Location.query.get(user.location_id)
            if location:
                location.country_id = location_data.get('country_id', location.country_id)
                location.state_id = location_data.get('state_id', location.state_id)
                location.city = location_data.get('city', location.city)
        else:
            location = Location(
                country_id=location_data.get('country_id'),
                state_id=location_data.get('state_id'),
                city=location_data.get('city')
            )
            db.session.add(location)
            db.session.flush()  # Get the ID without committing
            user.location_id = location.location_id
    
    # Update avatar if provided
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200


@token_required
def change_password(current_user):
    """
    Change user password.
    
    Request Body:
    {
        "current_password": "oldpassword",
        "new_password": "newpassword"
    }
    """
    data = request.get_json()
    user = User.query.get(current_user.user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    if not user.check_password(data.get('current_password')):
        return jsonify({'message': 'Current password is incorrect'}), 401
    
    user.password_hash = generate_password_hash(data.get('new_password'))
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200