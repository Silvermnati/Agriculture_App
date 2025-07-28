from flask import request, jsonify
from sqlalchemy.orm import joinedload

from server.models.location import Country, StateProvince, Location
from server.database import db
from server.utils.auth import token_required

def get_countries():
    """
    Get all countries.
    """
    countries = Country.query.order_by(Country.name).all()
    
    return jsonify({
        'countries': [country.to_dict() for country in countries]
    }), 200


def get_states(country_id):
    """
    Get all states/provinces for a specific country.
    """
    # Verify country exists
    country = Country.query.get(country_id)
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    states = StateProvince.query.filter_by(country_id=country_id).order_by(StateProvince.name).all()
    
    return jsonify({
        'states': [state.to_dict() for state in states],
        'country': country.to_dict()
    }), 200


def get_locations():
    """
    Get locations with optional filtering.
    
    Query Parameters:
    - country_id: integer
    - state_id: integer
    - search: string
    - climate_zone: string
    """
    # Get query parameters
    country_id = request.args.get('country_id', type=int)
    state_id = request.args.get('state_id', type=int)
    search = request.args.get('search')
    climate_zone = request.args.get('climate_zone')
    
    # Base query with eager loading
    query = Location.query.options(
        joinedload(Location.country),
        joinedload(Location.state)
    )
    
    # Apply filters
    if country_id:
        query = query.filter_by(country_id=country_id)
    
    if state_id:
        query = query.filter_by(state_id=state_id)
    
    if climate_zone:
        query = query.filter_by(climate_zone=climate_zone)
    
    if search:
        query = query.filter(Location.city.ilike(f'%{search}%'))
    
    # Order by city name
    locations = query.order_by(Location.city).all()
    
    return jsonify({
        'locations': [location.to_dict() for location in locations]
    }), 200


@token_required
def create_country(current_user):
    """
    Create a new country (admin only).
    
    Request Body:
    {
        "name": "Kenya",
        "code": "KE"
    }
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('name') or not data.get('code'):
        return jsonify({'message': 'Country name and code are required'}), 400
    
    # Check if country already exists
    existing_country = Country.query.filter(
        (Country.name == data.get('name')) | (Country.code == data.get('code'))
    ).first()
    
    if existing_country:
        return jsonify({'message': 'Country with this name or code already exists'}), 409
    
    # Create country
    country = Country(
        name=data.get('name'),
        code=data.get('code').upper()
    )
    
    db.session.add(country)
    db.session.commit()
    
    return jsonify({
        'message': 'Country created successfully',
        'country': country.to_dict()
    }), 201


@token_required
def create_state(current_user):
    """
    Create a new state/province (admin only).
    
    Request Body:
    {
        "country_id": 1,
        "name": "Nairobi",
        "code": "NRB"
    }
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('country_id') or not data.get('name'):
        return jsonify({'message': 'Country ID and state name are required'}), 400
    
    # Validate country exists
    country = Country.query.get(data.get('country_id'))
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    # Check if state already exists in this country
    existing_state = StateProvince.query.filter_by(
        country_id=data.get('country_id'),
        name=data.get('name')
    ).first()
    
    if existing_state:
        return jsonify({'message': 'State with this name already exists in this country'}), 409
    
    # Create state
    state = StateProvince(
        country_id=data.get('country_id'),
        name=data.get('name'),
        code=data.get('code')
    )
    
    db.session.add(state)
    db.session.commit()
    
    return jsonify({
        'message': 'State created successfully',
        'state': state.to_dict()
    }), 201


@token_required
def create_location(current_user):
    """
    Create a new location (admin only).
    
    Request Body:
    {
        "country_id": 1,
        "state_id": 1,
        "city": "Nairobi",
        "latitude": -1.2921,
        "longitude": 36.8219,
        "climate_zone": "tropical",
        "elevation": 1795
    }
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('country_id'):
        return jsonify({'message': 'Country ID is required'}), 400
    
    # Validate country exists
    country = Country.query.get(data.get('country_id'))
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    # Validate state if provided
    if data.get('state_id'):
        state = StateProvince.query.get(data.get('state_id'))
        if not state or state.country_id != data.get('country_id'):
            return jsonify({'message': 'State not found or does not belong to the specified country'}), 404
    
    # Create location
    location = Location(
        country_id=data.get('country_id'),
        state_id=data.get('state_id'),
        city=data.get('city'),
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        climate_zone=data.get('climate_zone'),
        elevation=data.get('elevation')
    )
    
    db.session.add(location)
    db.session.commit()
    
    return jsonify({
        'message': 'Location created successfully',
        'location': location.to_dict()
    }), 201


@token_required
def update_country(current_user, country_id):
    """
    Update a country (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    country = Country.query.get(country_id)
    
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check for conflicts if name or code is being updated
    if 'name' in data and data['name'] != country.name:
        existing = Country.query.filter_by(name=data['name']).first()
        if existing:
            return jsonify({'message': 'Country with this name already exists'}), 409
    
    if 'code' in data and data['code'] != country.code:
        existing = Country.query.filter_by(code=data['code'].upper()).first()
        if existing:
            return jsonify({'message': 'Country with this code already exists'}), 409
    
    # Update fields
    if 'name' in data:
        country.name = data['name']
    if 'code' in data:
        country.code = data['code'].upper()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Country updated successfully',
        'country': country.to_dict()
    }), 200


@token_required
def update_state(current_user, state_id):
    """
    Update a state/province (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    state = StateProvince.query.get(state_id)
    
    if not state:
        return jsonify({'message': 'State not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check for name conflicts if name is being updated
    if 'name' in data and data['name'] != state.name:
        existing = StateProvince.query.filter_by(
            country_id=state.country_id,
            name=data['name']
        ).first()
        if existing:
            return jsonify({'message': 'State with this name already exists in this country'}), 409
    
    # Update fields
    for field in ['name', 'code']:
        if field in data:
            setattr(state, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'State updated successfully',
        'state': state.to_dict()
    }), 200


@token_required
def delete_country(current_user, country_id):
    """
    Delete a country (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    country = Country.query.get(country_id)
    
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    # Check if country has states or locations
    state_count = StateProvince.query.filter_by(country_id=country_id).count()
    location_count = Location.query.filter_by(country_id=country_id).count()
    
    if state_count > 0 or location_count > 0:
        return jsonify({
            'message': f'Cannot delete country. It has {state_count} states and {location_count} locations'
        }), 409
    
    db.session.delete(country)
    db.session.commit()
    
    return jsonify({'message': 'Country deleted successfully'}), 200


@token_required
def delete_state(current_user, state_id):
    """
    Delete a state/province (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    state = StateProvince.query.get(state_id)
    
    if not state:
        return jsonify({'message': 'State not found'}), 404
    
    # Check if state has locations
    location_count = Location.query.filter_by(state_id=state_id).count()
    
    if location_count > 0:
        return jsonify({
            'message': f'Cannot delete state. It has {location_count} locations'
        }), 409
    
    db.session.delete(state)
    db.session.commit()
    
    return jsonify({'message': 'State deleted successfully'}), 200