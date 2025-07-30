import json
import pytest
from server.models.crop import Crop, UserCrop
from server.models.user import User
from server.database import db

def test_get_crops_list(client):
    """Test getting list of crops."""
    response = client.get('/api/crops')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data

def test_get_crops_with_filters(client):
    """Test getting crops with filters."""
    response = client.get('/api/crops?category=grain&season=spring')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True

def test_create_crop_admin(client, auth_tokens):
    """Test creating crop as admin."""
    data = {
        'name': 'Test Crop',
        'scientific_name': 'Testus cropus',
        'category': 'grain',
        'growing_season': 'spring',
        'climate_requirements': 'temperate',
        'water_requirements': 'moderate',
        'soil_type': 'loamy',
        'maturity_days': 90
    }
    
    response = client.post(
        '/api/crops',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert json_data['data']['name'] == 'Test Crop'

def test_create_crop_non_admin(client, auth_tokens):
    """Test creating crop as non-admin user."""
    data = {
        'name': 'Test Crop',
        'scientific_name': 'Testus cropus',
        'category': 'grain'
    }
    
    response = client.post(
        '/api/crops',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 403

def test_get_single_crop(client, app):
    """Test getting a single crop."""
    with app.app_context():
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain',
            growing_season='spring'
        )
        db.session.add(crop)
        db.session.commit()
        
        response = client.get(f'/api/crops/{crop.crop_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Test Crop'

def test_update_crop_admin(client, auth_tokens, app):
    """Test updating crop as admin."""
    with app.app_context():
        crop = Crop(
            name='Original Crop',
            scientific_name='Originalis cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.commit()
        
        data = {
            'name': 'Updated Crop',
            'category': 'vegetable'
        }
        
        response = client.put(
            f'/api/crops/{crop.crop_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Updated Crop'

def test_delete_crop_admin(client, auth_tokens, app):
    """Test deleting crop as admin."""
    with app.app_context():
        crop = Crop(
            name='Crop to Delete',
            scientific_name='Deleteus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.commit()
        
        response = client.delete(
            f'/api/crops/{crop.crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

# User Crop Tests

def test_get_user_crops(client, auth_tokens):
    """Test getting user's crop records."""
    response = client.get(
        '/api/user-crops',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True

def test_create_user_crop(client, auth_tokens, app):
    """Test creating user crop record."""
    with app.app_context():
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.commit()
        
        data = {
            'crop_id': crop.crop_id,
            'area_planted': 10.5,
            'area_unit': 'hectares',
            'planting_date': '2024-03-15',
            'expected_harvest': '2024-06-15',
            'season': 'spring',
            'notes': 'Test crop planting'
        }
        
        response = client.post(
            '/api/user-crops',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 201
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert float(json_data['data']['area_planted']) == 10.5

def test_get_single_user_crop(client, auth_tokens, app):
    """Test getting a single user crop record."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.flush()
        
        user_crop = UserCrop(
            user_id=user.user_id,
            crop_id=crop.crop_id,
            area_planted=5.0,
            area_unit='hectares',
            season='spring'
        )
        db.session.add(user_crop)
        db.session.commit()
        
        response = client.get(
            f'/api/user-crops/{user_crop.user_crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert float(json_data['data']['area_planted']) == 5.0

def test_update_user_crop(client, auth_tokens, app):
    """Test updating user crop record."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.flush()
        
        user_crop = UserCrop(
            user_id=user.user_id,
            crop_id=crop.crop_id,
            area_planted=5.0,
            area_unit='hectares',
            season='spring'
        )
        db.session.add(user_crop)
        db.session.commit()
        
        data = {
            'area_planted': 7.5,
            'yield_amount': 15.0,
            'yield_unit': 'tons'
        }
        
        response = client.put(
            f'/api/user-crops/{user_crop.user_crop_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert float(json_data['data']['area_planted']) == 7.5

def test_delete_user_crop(client, auth_tokens, app):
    """Test deleting user crop record."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.flush()
        
        user_crop = UserCrop(
            user_id=user.user_id,
            crop_id=crop.crop_id,
            area_planted=5.0,
            area_unit='hectares',
            season='spring'
        )
        db.session.add(user_crop)
        db.session.commit()
        
        response = client.delete(
            f'/api/user-crops/{user_crop.user_crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_access_other_user_crop(client, auth_tokens, app):
    """Test accessing another user's crop record."""
    with app.app_context():
        expert_user = User.query.filter_by(email='expert@example.com').first()
        crop = Crop(
            name='Test Crop',
            scientific_name='Testus cropus',
            category='grain'
        )
        db.session.add(crop)
        db.session.flush()
        
        user_crop = UserCrop(
            user_id=expert_user.user_id,
            crop_id=crop.crop_id,
            area_planted=5.0,
            area_unit='hectares',
            season='spring'
        )
        db.session.add(user_crop)
        db.session.commit()
        
        response = client.get(
            f'/api/user-crops/{user_crop.user_crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}  # Different user
        )
        
        assert response.status_code == 403