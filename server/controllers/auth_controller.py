from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash
import uuid
import jwt
from datetime import datetime, timedelta

from server.models.user import User
from server.models.location import Location
from server.database import db
from server.utils.auth import token_required
from server.utils.validators import validate_agricultural_data, sanitize_html_content
from server.utils.error_handlers import create_error_response, create_success_response
from server.utils.rate_limiter import rate_limit_auth

@rate_limit_auth
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
    
    if not data:
        return create_error_response('INVALID_REQUEST', 'Request body is required')
    
    # Validate input data
    validation_result = validate_agricultural_data(data, 'user_registration')
    if not validation_result.success:
        return validation_result.to_response()
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return create_error_response('DUPLICATE_ENTRY', 'User with this email already exists', status_code=409)
    
    # Sanitize bio if provided
    bio = data.get('bio')
    if bio:
        bio = sanitize_html_content(bio)
    
    # Create user with all the new fields including simple location fields
    user = User(
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        role=data.get('role', 'farmer'),
        bio=bio,
        phone_number=data.get('phone_number'),
        country=data.get('country'),
        city=data.get('city'),
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
    
    return create_success_response(
        data={
            'token': token,
            'user': user.to_dict()
        },
        message='User registered successfully',
        status_code=201
    )


@rate_limit_auth
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
        return create_error_response('INVALID_CREDENTIALS', 'Email and password are required', status_code=401)
    
    user = User.query.filter_by(email=auth.get('email')).first()
    
    if not user:
        return create_error_response('INVALID_CREDENTIALS', 'Invalid email or password', status_code=401)
    
    if not user.check_password(auth.get('password')):
        return create_error_response('INVALID_CREDENTIALS', 'Invalid email or password', status_code=401)
    
    if not user.is_active:
        return create_error_response('ACCOUNT_INACTIVE', 'Account is inactive', status_code=403)
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate token
    token = jwt.encode({
        'user_id': str(user.user_id),
        'exp': datetime.utcnow() + timedelta(days=1)
    }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    
    return create_success_response(
        data={
            'token': token,
            'user': user.to_dict()
        },
        message='Login successful'
    )


@token_required
def get_profile(current_user):
    """
    Get current user profile with agricultural data.
    """
    user = User.query.get(current_user.user_id)
    
    if not user:
        return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
    
    # Get user profile with related data
    user_data = user.to_dict()
    
    # Add location data if available
    if hasattr(user, 'location') and user.location:
        user_data['location'] = user.location.to_dict()
    
    # Add crops data if available
    if hasattr(user, 'crops'):
        user_data['crops'] = [crop.to_dict() for crop in user.crops]
    
    # Add expertise data if available
    if hasattr(user, 'expertise'):
        user_data['expertise'] = [exp.to_dict() for exp in user.expertise]
    
    return create_success_response(data=user_data)


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
    
    if not data:
        return create_error_response('INVALID_REQUEST', 'Request body is required')
    
    user = User.query.get(current_user.user_id)
    
    if not user:
        return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
    
    # Validate agricultural data if provided
    if any(field in data for field in ['farm_size', 'farming_experience', 'farming_type']):
        validation_result = validate_agricultural_data(data, 'user_registration')
        if not validation_result.success:
            return validation_result.to_response()
    
    # Sanitize bio if provided
    if 'bio' in data:
        data['bio'] = sanitize_html_content(data['bio'])
    
    # Update basic fields
    for field in ['first_name', 'last_name', 'bio', 'farm_size', 
                 'farm_size_unit', 'farming_experience', 'farming_type',
                 'phone_number', 'whatsapp_number', 'country', 'city']:
        if field in data:
            setattr(user, field, data[field])
    
    # Update location if provided (legacy location system)
    if 'location' in data:
        location_data = data['location']
        
        # Create new location or update existing
        if hasattr(user, 'location_id') and user.location_id:
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
            if hasattr(user, 'location_id'):
                user.location_id = location.location_id
    
    # Update avatar if provided
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return create_success_response(
        data={'user': user.to_dict()},
        message='Profile updated successfully'
    )


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
    
    if not data:
        return create_error_response('INVALID_REQUEST', 'Request body is required')
    
    if not data.get('current_password') or not data.get('new_password'):
        return create_error_response('MISSING_FIELDS', 'Current password and new password are required')
    
    user = User.query.get(current_user.user_id)
    
    if not user:
        return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
    
    if not user.check_password(data.get('current_password')):
        return create_error_response('INVALID_CREDENTIALS', 'Current password is incorrect', status_code=401)
    
    # Validate new password strength
    from server.utils.validators import validate_password_strength
    password_validation = validate_password_strength(data.get('new_password'))
    if not password_validation.success:
        return password_validation.to_response()
    
    user.password_hash = generate_password_hash(data.get('new_password'))
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return create_success_response(message='Password changed successfully')