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
    
    states = StateProvince.query.options(joinedload(StateProvince.country)).filter_by(country_id=country_id).order_by(StateProvince.name).all()
    
    # Include country information in each state
    states_with_country = []
    for state in states:
        state_dict = state.to_dict()
        state_dict['country'] = state.country.to_dict() if state.country else None
        states_with_country.append(state_dict)
    
    return jsonify({
        'states': states_with_country,
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
    
    # Debug: Log the received data
    print(f"DEBUG: Received location data: {data}")
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    country_id = data.get('country_id')
    if not country_id or str(country_id).strip() == '':
        print(f"DEBUG: Missing or empty country_id in data: {data}")
        return jsonify({'message': 'Country ID is required'}), 400
    
    # Validate country exists
    country = Country.query.get(data.get('country_id'))
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    # Validate state if provided
    state_id = data.get('state_id')
    if state_id and str(state_id).strip():  # Check if state_id exists and is not empty
        try:
            state_id = int(state_id)
            country_id = int(data.get('country_id'))
            state = StateProvince.query.get(state_id)
            if not state or state.country_id != country_id:
                return jsonify({'message': 'State not found or does not belong to the specified country'}), 404
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid state ID format'}), 400
    else:
        state_id = None  # Set to None if empty string or not provided
    
    # Create location
    location = Location(
        country_id=data.get('country_id'),
        state_id=state_id,  # Use the validated state_id
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
    Delete a country (admin only). Force delete removes all states and locations.
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    country = Country.query.get(country_id)
    
    if not country:
        return jsonify({'message': 'Country not found'}), 404
    
    try:
        # Get force parameter
        force = request.args.get('force', 'false').lower() == 'true'
        
        if not force:
            # Check if country has states or locations
            state_count = StateProvince.query.filter_by(country_id=country_id).count()
            location_count = Location.query.filter_by(country_id=country_id).count()
            
            if state_count > 0 or location_count > 0:
                return jsonify({
                    'message': f'Cannot delete country. It has {state_count} states and {location_count} locations. Use force=true to delete anyway.',
                    'states': state_count,
                    'locations': location_count
                }), 409
        
        else:
            # Force delete - remove all states and locations
            # First update users who reference these locations
            from server.models.user import User
            User.query.filter_by(country=country.name).update({'country': None})
            
            # Delete all locations in this country
            Location.query.filter_by(country_id=country_id).delete()
            
            # Delete all states in this country
            StateProvince.query.filter_by(country_id=country_id).delete()
        
        # Delete the country
        db.session.delete(country)
        db.session.commit()
        
        return jsonify({'message': 'Country deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting country {country_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete country'}), 500


@token_required
def update_location(current_user, location_id):
    """
    Update a location (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    location = Location.query.get(location_id)
    
    if not location:
        return jsonify({'message': 'Location not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate country if provided
    if 'country_id' in data:
        country = Country.query.get(data['country_id'])
        if not country:
            return jsonify({'message': 'Country not found'}), 404
        location.country_id = data['country_id']
    
    # Validate state if provided
    if 'state_id' in data:
        state_id = data['state_id']
        if state_id and str(state_id).strip():  # Check if state_id exists and is not empty
            try:
                state_id = int(state_id)
                state = StateProvince.query.get(state_id)
                if not state or state.country_id != location.country_id:
                    return jsonify({'message': 'State not found or does not belong to the specified country'}), 404
                location.state_id = state_id
            except (ValueError, TypeError):
                return jsonify({'message': 'Invalid state ID format'}), 400
        else:
            location.state_id = None
    
    # Update other fields
    for field in ['city', 'latitude', 'longitude', 'climate_zone', 'elevation']:
        if field in data:
            setattr(location, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Location updated successfully',
        'location': location.to_dict()
    }), 200


@token_required
def delete_location(current_user, location_id):
    """
    Delete a location (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    location = Location.query.get(location_id)
    
    if not location:
        return jsonify({'message': 'Location not found'}), 404
    
    db.session.delete(location)
    db.session.commit()
    
    return jsonify({'message': 'Location deleted successfully'}), 200


@token_required
def delete_state(current_user, state_id):
    """
    Delete a state/province (admin only). Force delete removes all locations.
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    state = StateProvince.query.get(state_id)
    
    if not state:
        return jsonify({'message': 'State not found'}), 404
    
    try:
        # Get force parameter
        force = request.args.get('force', 'false').lower() == 'true'
        
        if not force:
            # Check if state has locations
            location_count = Location.query.filter_by(state_id=state_id).count()
            
            if location_count > 0:
                return jsonify({
                    'message': f'Cannot delete state. It has {location_count} locations. Use force=true to delete anyway.',
                    'locations': location_count
                }), 409
        
        else:
            # Force delete - remove all locations in this state
            # First update users who reference these locations
            from server.models.user import User
            locations_in_state = Location.query.filter_by(state_id=state_id).all()
            for location in locations_in_state:
                User.query.filter_by(city=location.city).update({'city': None})
            
            # Delete all locations in this state
            Location.query.filter_by(state_id=state_id).delete()
        
        # Delete the state
        db.session.delete(state)
        db.session.commit()
        
        return jsonify({'message': 'State deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting state {state_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete state'}), 500