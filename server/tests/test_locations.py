import json
import pytest
from server.models.location import Country, StateProvince, Location
from server.database import db

def test_get_countries(client):
    """Test getting list of countries."""
    response = client.get('/api/locations/countries')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data
    assert len(json_data['data']) > 0

def test_get_states_by_country(client, app):
    """Test getting states by country."""
    with app.app_context():
        country = Country.query.first()
        
        response = client.get(f'/api/locations/states/{country.country_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert 'data' in json_data

def test_get_states_invalid_country(client):
    """Test getting states for invalid country."""
    response = client.get('/api/locations/states/99999')
    
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_get_locations(client):
    """Test getting list of locations."""
    response = client.get('/api/locations')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data

def test_get_locations_with_filters(client, app):
    """Test getting locations with filters."""
    with app.app_context():
        country = Country.query.first()
        
        response = client.get(f'/api/locations?country_id={country.country_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_create_country_admin(client, auth_tokens):
    """Test creating country as admin."""
    data = {
        'name': 'Test Country',
        'code': 'TC'
    }
    
    response = client.post(
        '/api/locations/countries',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert json_data['data']['name'] == 'Test Country'

def test_create_country_non_admin(client, auth_tokens):
    """Test creating country as non-admin."""
    data = {
        'name': 'Test Country',
        'code': 'TC'
    }
    
    response = client.post(
        '/api/locations/countries',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 403

def test_create_state_admin(client, auth_tokens, app):
    """Test creating state as admin."""
    with app.app_context():
        country = Country.query.first()
        
        data = {
            'name': 'Test State',
            'code': 'TS',
            'country_id': country.country_id
        }
        
        response = client.post(
            '/api/locations/states',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 201
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Test State'

def test_create_location_admin(client, auth_tokens, app):
    """Test creating location as admin."""
    with app.app_context():
        country = Country.query.first()
        state = StateProvince.query.first()
        
        data = {
            'country_id': country.country_id,
            'state_id': state.state_id,
            'city': 'Test City',
            'postal_code': '12345'
        }
        
        response = client.post(
            '/api/locations',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 201
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['city'] == 'Test City'

def test_update_country_admin(client, auth_tokens, app):
    """Test updating country as admin."""
    with app.app_context():
        country = Country(name='Original Country', code='OC')
        db.session.add(country)
        db.session.commit()
        
        data = {
            'name': 'Updated Country',
            'code': 'UC'
        }
        
        response = client.put(
            f'/api/locations/countries/{country.country_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Updated Country'

def test_update_state_admin(client, auth_tokens, app):
    """Test updating state as admin."""
    with app.app_context():
        country = Country.query.first()
        state = StateProvince(
            name='Original State',
            code='OS',
            country_id=country.country_id
        )
        db.session.add(state)
        db.session.commit()
        
        data = {
            'name': 'Updated State',
            'code': 'US'
        }
        
        response = client.put(
            f'/api/locations/states/{state.state_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Updated State'

def test_delete_country_admin(client, auth_tokens, app):
    """Test deleting country as admin."""
    with app.app_context():
        country = Country(name='Country to Delete', code='CD')
        db.session.add(country)
        db.session.commit()
        
        response = client.delete(
            f'/api/locations/countries/{country.country_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_state_admin(client, auth_tokens, app):
    """Test deleting state as admin."""
    with app.app_context():
        country = Country.query.first()
        state = StateProvince(
            name='State to Delete',
            code='SD',
            country_id=country.country_id
        )
        db.session.add(state)
        db.session.commit()
        
        response = client.delete(
            f'/api/locations/states/{state.state_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_location_admin(client, auth_tokens, app):
    """Test deleting location as admin."""
    with app.app_context():
        country = Country.query.first()
        state = StateProvince.query.first()
        location = Location(
            country_id=country.country_id,
            state_id=state.state_id,
            city='City to Delete'
        )
        db.session.add(location)
        db.session.commit()
        
        response = client.delete(
            f'/api/locations/{location.location_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_create_duplicate_country(client, auth_tokens, app):
    """Test creating duplicate country."""
    with app.app_context():
        existing_country = Country.query.first()
        
        data = {
            'name': existing_country.name,
            'code': existing_country.code
        }
        
        response = client.post(
            '/api/locations/countries',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 409  # Conflict

def test_create_state_invalid_country(client, auth_tokens):
    """Test creating state with invalid country."""
    data = {
        'name': 'Test State',
        'code': 'TS',
        'country_id': 99999  # Invalid country ID
    }
    
    response = client.post(
        '/api/locations/states',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
    )
    
    assert response.status_code == 400