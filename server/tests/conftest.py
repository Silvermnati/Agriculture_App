import os
import pytest
import jwt
from datetime import datetime, timedelta
from flask import current_app

from server import create_app
from server.database import db
from server.models.user import User
from server.models.location import Country, StateProvince, Location
from server.models.community import Community, CommunityMember, CommunityPost
from server.models.expert import ExpertProfile

@pytest.fixture(scope='function')
def app():
    """Create and configure a Flask app for testing."""
    app = create_app('testing')
    
    # Create all tables
    with app.app_context():
        db.create_all()
        
        # Create test data
        create_test_data()
        
        yield app
        
        # Clean up
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(scope='function')
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

def create_test_data():
    """Create test data for the tests."""
    # Create country and state
    country = Country(name='Test Country', code='TC')
    db.session.add(country)
    db.session.flush()
    
    state = StateProvince(name='Test State', code='TS', country_id=country.country_id)
    db.session.add(state)
    db.session.flush()
    
    # Create location
    location = Location(
        country_id=country.country_id,
        state_id=state.state_id,
        city='Test City'
    )
    db.session.add(location)
    db.session.flush()
    
    # Create users
    farmer = User(
        email='farmer@example.com',
        password='securepassword',
        first_name='John',
        last_name='Farmer',
        role='farmer',
        location_id=location.location_id,
        farm_size=25.5,
        farming_experience=10,
        farming_type='organic'
    )
    db.session.add(farmer)
    
    expert = User(
        email='expert@example.com',
        password='securepassword',
        first_name='Jane',
        last_name='Expert',
        role='expert'
    )
    db.session.add(expert)
    
    admin = User(
        email='admin@example.com',
        password='securepassword',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    db.session.add(admin)
    db.session.flush()
    
    # Create expert profile
    expert_profile = ExpertProfile(
        user_id=expert.user_id,
        title='Agricultural Scientist',
        specializations=['Corn', 'Wheat', 'Organic Farming'],
        certification='PhD in Agricultural Science',
        education='University of Agriculture',
        years_experience=15,
        hourly_rate=50.00,
        currency='USD',
        availability_status='available',
        languages_spoken=['English', 'Spanish'],
        service_areas=[location.location_id]
    )
    db.session.add(expert_profile)
    
    # Create community
    community = Community(
        name='Test Community',
        description='A test community for farmers',
        community_type='Crop-Specific',
        focus_crops=['Corn', 'Wheat'],
        location_city='Test City',
        location_country='Test Country',
        is_private=False,
        created_by=farmer.user_id
    )
    db.session.add(community)
    db.session.flush()
    
    # Add farmer as community member
    member = CommunityMember(
        community_id=community.community_id,
        user_id=farmer.user_id,
        role='admin',
        status='active'
    )
    db.session.add(member)
    
    # Create community post
    post = CommunityPost(
        community_id=community.community_id,
        user_id=farmer.user_id,
        content='This is a test post',
        image_url='https://example.com/image.jpg'
    )
    db.session.add(post)
    
    db.session.commit()

@pytest.fixture(scope='function')
def auth_tokens(app):
    """Generate authentication tokens for test users."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        admin = User.query.filter_by(email='admin@example.com').first()
        
        farmer_token = jwt.encode({
            'user_id': str(farmer.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        expert_token = jwt.encode({
            'user_id': str(expert.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        admin_token = jwt.encode({
            'user_id': str(admin.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return {
            'farmer': farmer_token,
            'expert': expert_token,
            'admin': admin_token,
            'farmer_id': str(farmer.user_id),
            'expert_id': str(expert.user_id),
            'admin_id': str(admin.user_id)
        }

@pytest.fixture(scope='function')
def test_community(app):
    """Get the test community."""
    with app.app_context():
        community = Community.query.filter_by(name='Test Community').first()
        return {
            'community_id': str(community.community_id),
            'name': community.name
        }

@pytest.fixture(scope='function')
def test_post(app):
    """Get the test post."""
    with app.app_context():
        post = CommunityPost.query.first()
        return {
            'post_id': str(post.post_id),
            'content': post.content
        }