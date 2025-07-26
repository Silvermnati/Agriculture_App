import unittest
import json
import jwt
from datetime import datetime, timedelta
from flask import current_app
from server import create_app, db
from server.models.user import User
from server.models.expert import ExpertProfile, Consultation, ExpertReview
from server.models.location import Location, Country, StateProvince

class TestExperts(unittest.TestCase):
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
        
        # Create test location
        location = Location(
            country_id=self.country_id,
            state_id=self.state_id,
            city='Test City',
            latitude=37.7749,
            longitude=-122.4194,
            climate_zone='Temperate'
        )
        db.session.add(location)
        db.session.commit()
        self.location_id = location.location_id
        
        # Create test users
        self.expert_user = User(
            email='expert@example.com',
            password='securepassword',
            first_name='Jane',
            last_name='Expert',
            role='expert',
            avatar_url='https://example.com/avatar.jpg',
            bio='Agricultural scientist with 15 years experience'
        )
        db.session.add(self.expert_user)
        
        self.farmer_user = User(
            email='farmer@example.com',
            password='securepassword',
            first_name='John',
            last_name='Farmer',
            role='farmer',
            farm_size=25.5,
            farming_experience=10,
            farming_type='organic',
            location_id=self.location_id
        )
        db.session.add(self.farmer_user)
        db.session.commit()
        
        # Create expert profile
        self.expert_profile = ExpertProfile(
            user_id=self.expert_user.user_id,
            title='Agricultural Scientist',
            specializations=['Corn', 'Wheat', 'Organic Farming'],
            certification='PhD in Agricultural Science',
            education='University of Agriculture',
            years_experience=15,
            hourly_rate=50.00,
            currency='USD',
            availability_status='available',
            languages_spoken=['English', 'Spanish'],
            service_areas=[self.location_id],
            rating=4.8,
            review_count=24
        )
        db.session.add(self.expert_profile)
        db.session.commit()
        
        # Generate tokens
        self.expert_token = jwt.encode({
            'user_id': str(self.expert_user.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'])
        
        self.farmer_token = jwt.encode({
            'user_id': str(self.farmer_user.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'])
    
    def tearDown(self):
        """Clean up after tests."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_get_experts(self):
        """Test getting paginated experts with filters."""
        # Get experts without filters
        response = self.client.get(
            '/api/experts',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('experts', json_data)
        self.assertIn('pagination', json_data)
        self.assertEqual(len(json_data['experts']), 1)
        self.assertEqual(json_data['experts'][0]['user']['first_name'], 'Jane')
        self.assertEqual(json_data['experts'][0]['title'], 'Agricultural Scientist')
        self.assertEqual(json_data['experts'][0]['specializations'], ['Corn', 'Wheat', 'Organic Farming'])
        self.assertEqual(float(json_data['experts'][0]['rating']), 4.8)
        
        # Test filtering by specialization
        response = self.client.get(
            '/api/experts?specialization=Corn',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertEqual(len(json_data['experts']), 1)
        
        # Test filtering by non-existent specialization
        response = self.client.get(
            '/api/experts?specialization=NonExistent',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertEqual(len(json_data['experts']), 0)
    
    def test_get_expert_profile(self):
        """Test getting detailed expert profile."""
        response = self.client.get(
            f'/api/experts/{self.expert_user.user_id}',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertEqual(json_data['user']['first_name'], 'Jane')
        self.assertEqual(json_data['user']['last_name'], 'Expert')
        self.assertEqual(json_data['title'], 'Agricultural Scientist')
        self.assertEqual(json_data['specializations'], ['Corn', 'Wheat', 'Organic Farming'])
        self.assertEqual(float(json_data['rating']), 4.8)
        self.assertEqual(json_data['review_count'], 24)
        self.assertEqual(float(json_data['hourly_rate']), 50.00)
        self.assertEqual(json_data['currency'], 'USD')
        self.assertEqual(json_data['availability_status'], 'available')
        self.assertEqual(json_data['languages_spoken'], ['English', 'Spanish'])
        self.assertEqual(json_data['service_areas'], [self.location_id])
        self.assertIn('availability_calendar', json_data)
    
    def test_create_expert_profile(self):
        """Test creating expert profile."""
        # Create a new expert user without profile
        new_expert = User(
            email='new.expert@example.com',
            password='securepassword',
            first_name='New',
            last_name='Expert',
            role='expert'
        )
        db.session.add(new_expert)
        db.session.commit()
        
        # Generate token for new expert
        new_expert_token = jwt.encode({
            'user_id': str(new_expert.user_id),
            'exp': datetime.utcnow() + timedelta(days=1)
        }, current_app.config['JWT_SECRET_KEY'])
        
        # Create profile data
        data = {
            'title': 'Crop Specialist',
            'specializations': ['Rice', 'Soybeans'],
            'certification': 'MSc in Agronomy',
            'education': 'Agricultural University',
            'years_experience': 8,
            'hourly_rate': 40.00,
            'currency': 'USD',
            'availability_status': 'available',
            'languages_spoken': ['English', 'French'],
            'service_areas': [self.location_id]
        }
        
        response = self.client.post(
            '/api/experts/profile',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {new_expert_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Expert profile created successfully')
        self.assertIn('profile', json_data)
        self.assertEqual(json_data['profile']['title'], 'Crop Specialist')
        self.assertEqual(json_data['profile']['specializations'], ['Rice', 'Soybeans'])
        
        # Check that profile was created in database
        profile = ExpertProfile.query.filter_by(user_id=new_expert.user_id).first()
        self.assertIsNotNone(profile)
        self.assertEqual(profile.title, 'Crop Specialist')
        self.assertEqual(profile.specializations, ['Rice', 'Soybeans'])
        self.assertEqual(float(profile.hourly_rate), 40.00)
    
    def test_update_expert_profile(self):
        """Test updating expert profile."""
        # Update profile data
        data = {
            'title': 'Senior Agricultural Scientist',
            'hourly_rate': 60.00,
            'availability_status': 'busy'
        }
        
        response = self.client.post(
            '/api/experts/profile',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {self.expert_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Expert profile updated successfully')
        self.assertIn('profile', json_data)
        self.assertEqual(json_data['profile']['title'], 'Senior Agricultural Scientist')
        self.assertEqual(float(json_data['profile']['hourly_rate']), 60.00)
        self.assertEqual(json_data['profile']['availability_status'], 'busy')
        
        # Check that profile was updated in database
        profile = ExpertProfile.query.filter_by(user_id=self.expert_user.user_id).first()
        self.assertEqual(profile.title, 'Senior Agricultural Scientist')
        self.assertEqual(float(profile.hourly_rate), 60.00)
        self.assertEqual(profile.availability_status, 'busy')
    
    def test_book_consultation(self):
        """Test booking a consultation with an expert."""
        # Consultation data
        data = {
            'expert_id': str(self.expert_user.user_id),
            'consultation_type': 'video',
            'scheduled_start': (datetime.utcnow() + timedelta(days=1)).isoformat(),
            'scheduled_end': (datetime.utcnow() + timedelta(days=1, hours=1)).isoformat(),
            'topic': 'Organic pest control for corn',
            'description': 'I\'m having issues with pests in my organic corn field...',
            'related_crops': [1],
            'farm_location_id': self.location_id
        }
        
        response = self.client.post(
            '/api/consultations',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Consultation booked successfully')
        self.assertIn('consultation', json_data)
        self.assertEqual(json_data['consultation']['expert']['name'], 'Jane Expert')
        self.assertEqual(json_data['consultation']['farmer']['name'], 'John Farmer')
        self.assertEqual(json_data['consultation']['consultation_type'], 'video')
        self.assertEqual(json_data['consultation']['topic'], 'Organic pest control for corn')
        self.assertEqual(json_data['consultation']['status'], 'pending')
        self.assertEqual(float(json_data['consultation']['amount']), 50.00)
        
        # Check that consultation was created in database
        consultation = Consultation.query.filter_by(
            expert_id=self.expert_user.user_id,
            farmer_id=self.farmer_user.user_id
        ).first()
        self.assertIsNotNone(consultation)
        self.assertEqual(consultation.consultation_type, 'video')
        self.assertEqual(consultation.topic, 'Organic pest control for corn')
        self.assertEqual(consultation.status, 'pending')
        self.assertEqual(float(consultation.amount), 50.00)
    
    def test_get_consultations(self):
        """Test getting user's consultations."""
        # Create a consultation
        consultation = Consultation(
            expert_id=self.expert_user.user_id,
            farmer_id=self.farmer_user.user_id,
            consultation_type='video',
            scheduled_start=datetime.utcnow() + timedelta(days=1),
            scheduled_end=datetime.utcnow() + timedelta(days=1, hours=1),
            topic='Organic pest control for corn',
            description='I\'m having issues with pests in my organic corn field...',
            related_crops=[1],
            farm_location_id=self.location_id,
            status='pending',
            payment_status='unpaid',
            amount=50.00,
            currency='USD'
        )
        db.session.add(consultation)
        db.session.commit()
        
        # Get consultations as farmer
        response = self.client.get(
            '/api/consultations?role=farmer',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('consultations', json_data)
        self.assertEqual(len(json_data['consultations']), 1)
        self.assertEqual(json_data['consultations'][0]['expert']['name'], 'Jane Expert')
        self.assertEqual(json_data['consultations'][0]['farmer']['name'], 'John Farmer')
        self.assertEqual(json_data['consultations'][0]['topic'], 'Organic pest control for corn')
        
        # Get consultations as expert
        response = self.client.get(
            '/api/consultations?role=expert',
            headers={'Authorization': f'Bearer {self.expert_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('consultations', json_data)
        self.assertEqual(len(json_data['consultations']), 1)
        self.assertEqual(json_data['consultations'][0]['expert']['name'], 'Jane Expert')
        self.assertEqual(json_data['consultations'][0]['farmer']['name'], 'John Farmer')
    
    def test_update_consultation_status(self):
        """Test updating consultation status."""
        # Create a consultation
        consultation = Consultation(
            expert_id=self.expert_user.user_id,
            farmer_id=self.farmer_user.user_id,
            consultation_type='video',
            scheduled_start=datetime.utcnow() + timedelta(days=1),
            scheduled_end=datetime.utcnow() + timedelta(days=1, hours=1),
            topic='Organic pest control for corn',
            description='I\'m having issues with pests in my organic corn field...',
            related_crops=[1],
            farm_location_id=self.location_id,
            status='pending',
            payment_status='unpaid',
            amount=50.00,
            currency='USD'
        )
        db.session.add(consultation)
        db.session.commit()
        
        # Update status
        data = {
            'status': 'confirmed'
        }
        
        response = self.client.put(
            f'/api/consultations/{consultation.consultation_id}/status',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {self.expert_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Consultation status updated successfully')
        self.assertIn('consultation', json_data)
        self.assertEqual(json_data['consultation']['status'], 'confirmed')
        
        # Check that consultation was updated in database
        consultation = Consultation.query.get(consultation.consultation_id)
        self.assertEqual(consultation.status, 'confirmed')
    
    def test_add_review(self):
        """Test adding a review for an expert."""
        # Create a consultation
        consultation = Consultation(
            expert_id=self.expert_user.user_id,
            farmer_id=self.farmer_user.user_id,
            consultation_type='video',
            scheduled_start=datetime.utcnow() - timedelta(days=1),
            scheduled_end=datetime.utcnow() - timedelta(days=1, hours=-1),
            topic='Organic pest control for corn',
            description='I\'m having issues with pests in my organic corn field...',
            related_crops=[1],
            farm_location_id=self.location_id,
            status='completed',
            payment_status='paid',
            amount=50.00,
            currency='USD'
        )
        db.session.add(consultation)
        db.session.commit()
        
        # Add review
        data = {
            'consultation_id': str(consultation.consultation_id),
            'rating': 5,
            'comment': 'Excellent advice on organic pest control!'
        }
        
        response = self.client.post(
            f'/api/experts/{self.expert_user.user_id}/reviews',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {self.farmer_token}'}
        )
        
        # Check response
        self.assertEqual(response.status_code, 201)
        json_data = json.loads(response.data)
        self.assertIn('message', json_data)
        self.assertEqual(json_data['message'], 'Review added successfully')
        self.assertIn('review', json_data)
        self.assertEqual(json_data['review']['rating'], 5)
        self.assertEqual(json_data['review']['comment'], 'Excellent advice on organic pest control!')
        
        # Check that review was created in database
        review = ExpertReview.query.filter_by(
            expert_id=self.expert_user.user_id,
            reviewer_id=self.farmer_user.user_id
        ).first()
        self.assertIsNotNone(review)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, 'Excellent advice on organic pest control!')
        
        # Check that expert profile rating was updated
        expert_profile = ExpertProfile.query.filter_by(user_id=self.expert_user.user_id).first()
        self.assertEqual(expert_profile.review_count, 25)  # 24 + 1

if __name__ == '__main__':
    unittest.main()