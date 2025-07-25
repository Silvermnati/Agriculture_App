import json
import pytest
from server.models.expert import ExpertReview, ExpertProfile, Consultation
from server.models.user import User
from server.database import db

def test_get_reviews_list(client):
    """Test getting list of reviews."""
    response = client.get('/api/reviews')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data

def test_get_reviews_with_filters(client, app):
    """Test getting reviews with filters."""
    with app.app_context():
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        response = client.get(f'/api/reviews?expert_id={expert_profile.expert_id}&rating=5')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_create_review_authenticated(client, auth_tokens, app):
    """Test creating review as authenticated user."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        # Create a consultation first
        consultation = Consultation(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            consultation_type='video_call',
            topic='Crop management',
            description='Need help with corn farming',
            scheduled_date='2024-03-15 10:00:00',
            duration_minutes=60,
            status='completed',
            total_cost=50.00,
            currency='USD'
        )
        db.session.add(consultation)
        db.session.commit()
        
        data = {
            'expert_id': expert_profile.expert_id,
            'consultation_id': consultation.consultation_id,
            'rating': 5,
            'review_text': 'Excellent consultation! Very helpful advice.',
            'would_recommend': True
        }
        
        response = client.post(
            '/api/reviews',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 201
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['rating'] == 5

def test_create_review_unauthenticated(client):
    """Test creating review without authentication."""
    data = {
        'expert_id': 1,
        'rating': 5,
        'review_text': 'Great expert!'
    }
    
    response = client.post(
        '/api/reviews',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    assert response.status_code == 401

def test_create_review_invalid_rating(client, auth_tokens, app):
    """Test creating review with invalid rating."""
    with app.app_context():
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        data = {
            'expert_id': expert_profile.expert_id,
            'rating': 6,  # Invalid rating (should be 1-5)
            'review_text': 'Great expert!'
        }
        
        response = client.post(
            '/api/reviews',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 400
        json_data = json.loads(response.data)
        assert json_data['success'] is False

def test_get_single_review(client, app, auth_tokens):
    """Test getting a single review."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=5,
            review_text='Excellent service!',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        response = client.get(f'/api/reviews/{review.review_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['rating'] == 5

def test_get_nonexistent_review(client):
    """Test getting non-existent review."""
    response = client.get('/api/reviews/99999999-9999-9999-9999-999999999999')
    
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_update_review_owner(client, auth_tokens, app):
    """Test updating review by owner."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=4,
            review_text='Good service',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        data = {
            'rating': 5,
            'review_text': 'Excellent service! Updated review.',
            'would_recommend': True
        }
        
        response = client.put(
            f'/api/reviews/{review.review_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['rating'] == 5

def test_update_review_unauthorized(client, auth_tokens, app):
    """Test updating review by non-owner."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=4,
            review_text='Good service',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        data = {
            'rating': 5,
            'review_text': 'Updated by wrong user'
        }
        
        response = client.put(
            f'/api/reviews/{review.review_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}  # Different user
        )
        
        assert response.status_code == 403

def test_delete_review_owner(client, auth_tokens, app):
    """Test deleting review by owner."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=4,
            review_text='Service to delete',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        response = client.delete(
            f'/api/reviews/{review.review_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_review_admin(client, auth_tokens, app):
    """Test deleting review by admin."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=4,
            review_text='Service to delete by admin',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        response = client.delete(
            f'/api/reviews/{review.review_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_review_unauthorized(client, auth_tokens, app):
    """Test deleting review by unauthorized user."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            rating=4,
            review_text='Protected review',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        response = client.delete(
            f'/api/reviews/{review.review_id}',
            headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}  # Different user
        )
        
        assert response.status_code == 403

def test_create_duplicate_review(client, auth_tokens, app):
    """Test creating duplicate review for same consultation."""
    with app.app_context():
        farmer = User.query.filter_by(email='farmer@example.com').first()
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        # Create consultation
        consultation = Consultation(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            consultation_type='video_call',
            topic='Crop management',
            description='Need help with corn farming',
            scheduled_date='2024-03-15 10:00:00',
            duration_minutes=60,
            status='completed',
            total_cost=50.00,
            currency='USD'
        )
        db.session.add(consultation)
        db.session.flush()
        
        # Create first review
        review = ExpertReview(
            farmer_id=farmer.user_id,
            expert_id=expert_profile.expert_id,
            consultation_id=consultation.consultation_id,
            rating=5,
            review_text='First review',
            would_recommend=True
        )
        db.session.add(review)
        db.session.commit()
        
        # Try to create duplicate review
        data = {
            'expert_id': expert_profile.expert_id,
            'consultation_id': consultation.consultation_id,
            'rating': 4,
            'review_text': 'Duplicate review'
        }
        
        response = client.post(
            '/api/reviews',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 409  # Conflict

def test_get_reviews_by_expert(client, app):
    """Test getting reviews filtered by expert."""
    with app.app_context():
        expert = User.query.filter_by(email='expert@example.com').first()
        expert_profile = ExpertProfile.query.filter_by(user_id=expert.user_id).first()
        
        response = client.get(f'/api/reviews?expert_id={expert_profile.expert_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True