import json
import pytest
from flask import url_for

def test_register_user(client):
    """Test user registration with agricultural fields."""
    # Create test data
    data = {
        'email': 'newfarmer@example.com',
        'password': 'securepassword',
        'first_name': 'New',
        'last_name': 'Farmer',
        'role': 'farmer',
        'farm_size': 25.5,
        'farm_size_unit': 'hectares',
        'farming_experience': 10,
        'farming_type': 'organic'
    }
    
    # Send request
    response = client.post(
        '/api/auth/register',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert 'token' in json_data
    assert 'user' in json_data
    assert json_data['user']['email'] == 'newfarmer@example.com'
    assert json_data['user']['role'] == 'farmer'
    assert float(json_data['user']['farm_size']) == 25.5

def test_register_duplicate_email(client):
    """Test registration with duplicate email."""
    # Create test data
    data = {
        'email': 'farmer@example.com',  # This email already exists in test data
        'password': 'securepassword',
        'first_name': 'Duplicate',
        'last_name': 'Farmer',
        'role': 'farmer'
    }
    
    # Send request
    response = client.post(
        '/api/auth/register',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 409
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'User already exists'

def test_login_success(client):
    """Test successful login."""
    # Create test data
    data = {
        'email': 'farmer@example.com',
        'password': 'securepassword'
    }
    
    # Send request
    response = client.post(
        '/api/auth/login',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'token' in json_data
    assert 'user' in json_data
    assert json_data['user']['email'] == 'farmer@example.com'

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    # Create test data
    data = {
        'email': 'farmer@example.com',
        'password': 'wrongpassword'
    }
    
    # Send request
    response = client.post(
        '/api/auth/login',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    # Check response
    assert response.status_code == 401
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Invalid credentials'

def test_get_profile(client, auth_tokens):
    """Test getting user profile."""
    # Send request
    response = client.get(
        '/api/auth/profile',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['email'] == 'farmer@example.com'
    assert json_data['first_name'] == 'John'
    assert float(json_data['farm_size']) == 25.5
    assert json_data['farming_experience'] == 10
    assert json_data['farming_type'] == 'organic'

def test_update_profile(client, auth_tokens):
    """Test updating user profile."""
    # Create test data
    data = {
        'first_name': 'Johnny',
        'bio': 'Organic farmer with 10 years of experience',
        'farm_size': 30.5,
        'farming_experience': 12
    }
    
    # Send request
    response = client.put(
        '/api/auth/profile',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Profile updated successfully'
    
    # Verify profile was updated
    response = client.get(
        '/api/auth/profile',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    json_data = json.loads(response.data)
    assert json_data['first_name'] == 'Johnny'
    assert json_data['bio'] == 'Organic farmer with 10 years of experience'
    assert float(json_data['farm_size']) == 30.5
    assert json_data['farming_experience'] == 12

def test_unauthorized_access(client):
    """Test accessing protected route without token."""
    # Send request without token
    response = client.get('/api/auth/profile')
    
    # Check response
    assert response.status_code == 401
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Token is missing'

def test_invalid_token(client):
    """Test accessing protected route with invalid token."""
    # Send request with invalid token
    response = client.get(
        '/api/auth/profile',
        headers={'Authorization': 'Bearer invalid_token'}
    )
    
    # Check response
    assert response.status_code == 401
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert 'Invalid token' in json_data['message']