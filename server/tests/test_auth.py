import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import current_app
from server import create_app, db
from server.models.user import User
from server.models.location import Location, Country, StateProvince

class TestAuth(unittest.TestCase):
    def setUp(self):
        """Set up test environment."""
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()
        
        # Create test country and state
        country = Country(name='Test Country', code='TC')
        db.session.add(country)
        db.session.commit()
        
        state = StateProvince(name='Test State', code='TS', country_id=country.country_id)
        db.session.add(state)
        db.session.commit()
        
        self.country_id = country.country_id
        self.state_id = state.state_id
    
    def tearDown(self):
        """Clean up after tests."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_register_user(self):
        """Test user registration with agricultural fields."""
        # Create test data
        data = {
            'email': 'farmer@example.com',
            'password': 'securepassword',
            'first_name': 'John',
            'last_name': 'Farmer',
            'role': 'farmer',
            'location': {
                'country_id': self.country_id,
                'state_id': self.state_id,
                'city': 'Farmville'
            },
            'farm_size': 25.5,
            'farm_size_unit': 'hectares',
            'farming_experience': 10,
            'farming_type': 'organic'
        }
        
        # Send request
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('token', json_data)
        self.assertIn('user', json_data)
        self.assertEqual(json_data['user']['email'], 'farmer@example.com')
        self.assertEqual(json_data['user']['role'], 'farmer')
        self.assertEqual(float(json_data['user']['farm_size']), 25.5)
        
        # Check that user was created in database
        user = User.query.filter_by(email='farmer@example.com').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'John')
        self.assertEqual(user.role, 'farmer')
    
    def test_register_duplicate_email(self):
        """Test registration with duplicate email."""
        # Create a user
        user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer'
        )
        db.session.add(user)
        db.session.commit()
        
        # Try to register with same email
        data = {
            'email': 'farmer@example.com',
            'password': 'securepassword',
            'first_name': 'Jane',
            'last_name': 'Farmer',
            'role': 'farmer'
        }
        
        response = self.client.post(
            '/api/auth/register',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 409)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'User already exists')
    
    def test_login_success(self):
        """Test successful login."""
        # Create a user
        user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer'
        )
        db.session.add(user)
        db.session.commit()
        
        # Login
        data = {
            'email': 'farmer@example.com',
            'password': 'securepassword'
        }
        
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('token', json_data)
        self.assertIn('user', json_data)
        self.assertEqual(json_data['user']['email'], 'farmer@example.com')
        
        # Check that last_login was updated
        user = User.query.filter_by(email='farmer@example.com').first()
        self.assertIsNotNone(user.last_login)
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        # Create a user
        user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer'
        )
        db.session.add(user)
        db.session.commit()
        
        # Login with wrong password
        data = {
            'email': 'farmer@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            '/api/auth/login',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 401)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Invalid credentials')
    
    def test_get_profile(self):
        """Test getting user profile."""
        # Create a user
        user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer',
            farm_size=25.5,
            farming_experience=10,
            farming_type='organic'
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = jwt.encode({
            'user_id': str(user.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'])
        
        # Get profile
        response = self.client.get(
            '/api/auth/profile',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['email'], 'farmer@example.com')
        self.assertEqual(json_data['first_name'], 'John')
        self.assertEqual(float(json_data['farm_size']), 25.5)
        self.assertEqual(json_data['farming_experience'], 10)
        self.assertEqual(json_data['farming_type'], 'organic')
    
    def test_update_profile(self):
        """Test updating user profile."""
        # Create a user
        user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer',
            farm_size=25.5,
            farming_experience=10,
            farming_type='organic'
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = jwt.encode({
            'user_id': str(user.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'])
        
        # Update profile
        data = {
            'first_name': 'Johnny',
            'farm_size': 30.5,
            'farming_experience': 12,
            'farming_type': 'mixed',
            'location': {
                'country_id': self.country_id,
                'state_id': self.state_id,
                'city': 'Farmville'
            }
        }
        
        response = self.client.put(
            '/api/auth/profile',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Profile updated successfully')
        
        # Check that user was updated in database
        user = User.query.filter_by(email='farmer@example.com').first()
        self.assertEqual(user.first_name, 'Johnny')
        self.assertEqual(float(user.farm_size), 30.5)
        self.assertEqual(user.farming_experience, 12)
        self.assertEqual(user.farming_type, 'mixed')
        self.assertIsNotNone(user.location_id)

if __name__ == '__main__':
    unittest.main()