from flask import request, jsonify
from datetime import datetime
from sqlalchemy.orm import joinedload

from server.models.crop import Crop, UserCrop
from server.database import db
from server.utils.auth import token_required

def get_crops():
    """
    Get all crops with optional filtering.
    
    Query Parameters:
    - category: string (cereal, vegetable, fruit, legume)
    - season: string (spring, summer, fall, winter, year-round)
    - search: string
    - water_requirements: string (low, medium, high)
    """
    # Get query parameters
    category = request.args.get('category', type=str)
    season = request.args.get('season', type=str)
    search = request.args.get('search')
    water_requirements = request.args.get('water_requirements', type=str)
    
    # Base query
    query = Crop.query
    
    # Apply filters
    if category:
        query = query.filter_by(category=category)
    
    if season:
        query = query.filter_by(growing_season=season)
        
    if water_requirements:
        query = query.filter_by(water_requirements=water_requirements)
    
    if search:
        query = query.filter(
            (Crop.name.ilike(f'%{search}%')) | 
            (Crop.scientific_name.ilike(f'%{search}%'))
        )
    
    # Order by name
    crops = query.order_by(Crop.name).all()
    
    return jsonify({
        'crops': [crop.to_dict() for crop in crops]
    }), 200


@token_required
def create_crop(current_user):
    """
    Create a new crop (admin only).
    
    Request Body:
    {
        "name": "Corn",
        "scientific_name": "Zea mays",
        "category": "cereal",
        "growing_season": "summer",
        "climate_requirements": "Warm climate with adequate rainfall",
        "water_requirements": "medium",
        "soil_type": "Well-drained, fertile soil",
        "maturity_days": 90
    }
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'message': 'Crop name is required'}), 400
    
    # Check if crop already exists
    existing_crop = Crop.query.filter_by(name=data.get('name')).first()
    if existing_crop:
        return jsonify({'message': 'Crop with this name already exists'}), 409
    
    # Create crop
    crop = Crop(
        name=data.get('name'),
        scientific_name=data.get('scientific_name'),
        category=data.get('category'),
        growing_season=data.get('growing_season'),
        climate_requirements=data.get('climate_requirements'),
        water_requirements=data.get('water_requirements'),
        soil_type=data.get('soil_type'),
        maturity_days=data.get('maturity_days')
    )
    
    db.session.add(crop)
    db.session.commit()
    
    return jsonify({
        'message': 'Crop created successfully',
        'crop': crop.to_dict()
    }), 201


def get_crop(crop_id):
    """
    Get a specific crop by ID.
    """
    crop = Crop.query.get(crop_id)
    
    if not crop:
        return jsonify({'message': 'Crop not found'}), 404
    
    return jsonify(crop.to_dict()), 200


@token_required
def update_crop(current_user, crop_id):
    """
    Update a crop (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    crop = Crop.query.get(crop_id)
    
    if not crop:
        return jsonify({'message': 'Crop not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check for name conflicts if name is being updated
    if 'name' in data and data['name'] != crop.name:
        existing_crop = Crop.query.filter_by(name=data.get('name')).first()
        if existing_crop:
            return jsonify({'message': 'Crop with this name already exists'}), 409
    
    # Update fields
    for field in ['name', 'scientific_name', 'category', 'growing_season', 
                 'climate_requirements', 'water_requirements', 'soil_type', 'maturity_days']:
        if field in data:
            setattr(crop, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Crop updated successfully',
        'crop': crop.to_dict()
    }), 200


@token_required
def delete_crop(current_user, crop_id):
    """
    Delete a crop (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    crop = Crop.query.get(crop_id)
    
    if not crop:
        return jsonify({'message': 'Crop not found'}), 404
    
    # Check if crop is being used by users
    user_crop_count = UserCrop.query.filter_by(crop_id=crop_id).count()
    if user_crop_count > 0:
        return jsonify({
            'message': f'Cannot delete crop. It is being used by {user_crop_count} user(s)'
        }), 409
    
    db.session.delete(crop)
    db.session.commit()
    
    return jsonify({'message': 'Crop deleted successfully'}), 200


# User Crop Management Functions

@token_required
def get_user_crops(current_user):
    """
    Get current user's crop records.
    
    Query Parameters:
    - season: string
    - crop_id: integer
    - year: integer
    """
    # Get query parameters
    season = request.args.get('season', type=str)
    crop_id = request.args.get('crop_id', type=int)
    year = request.args.get('year', type=int)
    
    # Base query
    query = UserCrop.query.options(
        joinedload(UserCrop.crop)
    ).filter_by(user_id=current_user.user_id)
    
    # Apply filters
    if season:
        query = query.filter_by(season=season)
    
    if crop_id:
        query = query.filter_by(crop_id=crop_id)
    
    if year:
        query = query.filter(
            db.func.extract('year', UserCrop.planting_date) == year
        )
    
    # Order by planting date (most recent first)
    user_crops = query.order_by(UserCrop.planting_date.desc()).all()
    
    return jsonify({
        'user_crops': [user_crop.to_dict() for user_crop in user_crops]
    }), 200


@token_required
def create_user_crop(current_user):
    """
    Create a new user crop record.
    
    Request Body:
    {
        "crop_id": 1,
        "area_planted": 2.5,
        "area_unit": "hectares",
        "planting_date": "2024-03-15",
        "expected_harvest": "2024-06-15",
        "notes": "First time growing this variety",
        "season": "spring2024"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('crop_id'):
        return jsonify({'message': 'Crop ID is required'}), 400
    
    # Validate crop exists
    crop = Crop.query.get(data.get('crop_id'))
    if not crop:
        return jsonify({'message': 'Crop not found'}), 404
    
    # Parse dates
    planting_date = None
    expected_harvest = None
    actual_harvest = None
    
    try:
        if data.get('planting_date'):
            planting_date = datetime.strptime(data.get('planting_date'), '%Y-%m-%d').date()
        if data.get('expected_harvest'):
            expected_harvest = datetime.strptime(data.get('expected_harvest'), '%Y-%m-%d').date()
        if data.get('actual_harvest'):
            actual_harvest = datetime.strptime(data.get('actual_harvest'), '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Create user crop record
    user_crop = UserCrop(
        user_id=current_user.user_id,
        crop_id=data.get('crop_id'),
        area_planted=data.get('area_planted'),
        area_unit=data.get('area_unit', 'hectares'),
        planting_date=planting_date,
        expected_harvest=expected_harvest,
        actual_harvest=actual_harvest,
        yield_amount=data.get('yield_amount'),
        yield_unit=data.get('yield_unit', 'kg'),
        notes=data.get('notes'),
        season=data.get('season')
    )
    
    db.session.add(user_crop)
    db.session.commit()
    
    return jsonify({
        'message': 'Crop record created successfully',
        'user_crop': user_crop.to_dict()
    }), 201


@token_required
def get_user_crop(current_user, user_crop_id):
    """
    Get a specific user crop record.
    """
    user_crop = UserCrop.query.options(
        joinedload(UserCrop.crop)
    ).filter_by(
        user_crop_id=user_crop_id,
        user_id=current_user.user_id
    ).first()
    
    if not user_crop:
        return jsonify({'message': 'Crop record not found'}), 404
    
    return jsonify(user_crop.to_dict()), 200


@token_required
def update_user_crop(current_user, user_crop_id):
    """
    Update a user crop record.
    """
    user_crop = UserCrop.query.filter_by(
        user_crop_id=user_crop_id,
        user_id=current_user.user_id
    ).first()
    
    if not user_crop:
        return jsonify({'message': 'Crop record not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate crop if being updated
    if 'crop_id' in data:
        crop = Crop.query.get(data.get('crop_id'))
        if not crop:
            return jsonify({'message': 'Crop not found'}), 404
        user_crop.crop_id = data.get('crop_id')
    
    # Update basic fields
    for field in ['area_planted', 'area_unit', 'yield_amount', 'yield_unit', 'notes', 'season']:
        if field in data:
            setattr(user_crop, field, data[field])
    
    # Update dates
    try:
        if 'planting_date' in data and data['planting_date']:
            user_crop.planting_date = datetime.strptime(data['planting_date'], '%Y-%m-%d').date()
        if 'expected_harvest' in data and data['expected_harvest']:
            user_crop.expected_harvest = datetime.strptime(data['expected_harvest'], '%Y-%m-%d').date()
        if 'actual_harvest' in data and data['actual_harvest']:
            user_crop.actual_harvest = datetime.strptime(data['actual_harvest'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Crop record updated successfully',
        'user_crop': user_crop.to_dict()
    }), 200


@token_required
def delete_user_crop(current_user, user_crop_id):
    """
    Delete a user crop record.
    """
    user_crop = UserCrop.query.filter_by(
        user_crop_id=user_crop_id,
        user_id=current_user.user_id
    ).first()
    
    if not user_crop:
        return jsonify({'message': 'Crop record not found'}), 404
    
    db.session.delete(user_crop)
    db.session.commit()
    
    return jsonify({'message': 'Crop record deleted successfully'}), 200