import json
import pytest
from server.models.article import Article
from server.models.crop import Crop, UserCrop
from server.models.post import Category, Tag
from server.models.location import Country, StateProvince
from server.models.expert import ExpertReview, ExpertProfile
from server.models.user import User
from server.database import db

class TestArticleIntegration:
    """Integration tests for complete article CRUD workflow."""
    
    def test_complete_article_workflow(self, client, auth_tokens, app):
        """Test complete article lifecycle from creation to deletion."""
        with app.app_context():
            # Create category first
            category = Category(
                name='Integration Test Category',
                description='Category for integration testing',
                is_agricultural_specific=True
            )
            db.session.add(category)
            db.session.commit()
            
            # 1. Create article
            article_data = {
                'title': 'Integration Test Article',
                'content': '<p>This is integration test content</p>',
                'excerpt': 'Integration test excerpt',
                'category_id': category.category_id,
                'tags': ['integration', 'testing'],
                'related_crops': ['corn', 'wheat'],
                'season_relevance': 'spring',
                'status': 'published'
            }
            
            create_response = client.post(
                '/api/articles',
                data=json.dumps(article_data),
                content_type='application/json',
                headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
            )
            
            assert create_response.status_code == 201
            created_article = json.loads(create_response.data)['data']
            article_id = created_article['article_id']
            
            # 2. Read article
            read_response = client.get(f'/api/articles/{article_id}')
            assert read_response.status_code == 200
            read_article = json.loads(read_response.data)['data']
            assert read_article['title'] == 'Integration Test Article'
            
            # 3. Update article
            update_data = {
                'title': 'Updated Integration Test Article',
                'content': '<p>Updated integration test content</p>',
                'status': 'draft'
            }
            
            update_response = client.put(
                f'/api/articles/{article_id}',
                data=json.dumps(update_data),
                content_type='application/json',
                headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
            )
            
            assert update_response.status_code == 200
            updated_article = json.loads(update_response.data)['data']
            assert updated_article['title'] == 'Updated Integration Test Article'
            assert updated_article['status'] == 'draft'
            
            # 4. List articles (should include our article)
            list_response = client.get('/api/articles')
            assert list_response.status_code == 200
            articles_list = json.loads(list_response.data)['data']
            article_found = any(article['article_id'] == article_id for article in articles_list)
            assert article_found
            
            # 5. Delete article
            delete_response = client.delete(
                f'/api/articles/{article_id}',
                headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
            )
            
            assert delete_response.status_code == 200
            
            # 6. Verify deletion
            verify_response = client.get(f'/api/articles/{article_id}')
            assert verify_response.status_code == 404

class TestCropIntegration:
    """Integration tests for complete crop CRUD workflow."""
    
    def test_complete_crop_workflow(self, client, auth_tokens):
        """Test complete crop lifecycle from creation to deletion."""
        # 1. Create crop (admin only)
        crop_data = {
            'name': 'Integration Test Crop',
            'scientific_name': 'Integrationus testus',
            'category': 'grain',
            'growing_season': 'spring',
            'climate_requirements': 'temperate',
            'water_requirements': 'moderate',
            'soil_type': 'loamy',
            'maturity_days': 90
        }
        
        create_response = client.post(
            '/api/crops',
            data=json.dumps(crop_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert create_response.status_code == 201
        created_crop = json.loads(create_response.data)['data']
        crop_id = created_crop['crop_id']
        
        # 2. Read crop
        read_response = client.get(f'/api/crops/{crop_id}')
        assert read_response.status_code == 200
        read_crop = json.loads(read_response.data)['data']
        assert read_crop['name'] == 'Integration Test Crop'
        
        # 3. Update crop
        update_data = {
            'name': 'Updated Integration Test Crop',
            'maturity_days': 95
        }
        
        update_response = client.put(
            f'/api/crops/{crop_id}',
            data=json.dumps(update_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert update_response.status_code == 200
        updated_crop = json.loads(update_response.data)['data']
        assert updated_crop['name'] == 'Updated Integration Test Crop'
        assert updated_crop['maturity_days'] == 95
        
        # 4. Create user crop record using this crop
        user_crop_data = {
            'crop_id': crop_id,
            'area_planted': 15.5,
            'area_unit': 'hectares',
            'planting_date': '2024-03-15',
            'expected_harvest': '2024-06-15',
            'season': 'spring',
            'notes': 'Integration test crop planting'
        }
        
        user_crop_response = client.post(
            '/api/user-crops',
            data=json.dumps(user_crop_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert user_crop_response.status_code == 201
        user_crop = json.loads(user_crop_response.data)['data']
        user_crop_id = user_crop['user_crop_id']
        
        # 5. Update user crop record
        user_crop_update = {
            'yield_amount': 25.0,
            'yield_unit': 'tons',
            'actual_harvest': '2024-06-20'
        }
        
        user_crop_update_response = client.put(
            f'/api/user-crops/{user_crop_id}',
            data=json.dumps(user_crop_update),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert user_crop_update_response.status_code == 200
        updated_user_crop = json.loads(user_crop_update_response.data)['data']
        assert float(updated_user_crop['yield_amount']) == 25.0
        
        # 6. Delete user crop record
        user_crop_delete_response = client.delete(
            f'/api/user-crops/{user_crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert user_crop_delete_response.status_code == 200
        
        # 7. Delete crop
        delete_response = client.delete(
            f'/api/crops/{crop_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert delete_response.status_code == 200

class TestLocationIntegration:
    """Integration tests for complete location CRUD workflow."""
    
    def test_complete_location_workflow(self, client, auth_tokens):
        """Test complete location hierarchy creation and management."""
        # 1. Create country
        country_data = {
            'name': 'Integration Test Country',
            'code': 'ITC'
        }
        
        country_response = client.post(
            '/api/locations/countries',
            data=json.dumps(country_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert country_response.status_code == 201
        created_country = json.loads(country_response.data)['data']
        country_id = created_country['country_id']
        
        # 2. Create state in the country
        state_data = {
            'name': 'Integration Test State',
            'code': 'ITS',
            'country_id': country_id
        }
        
        state_response = client.post(
            '/api/locations/states',
            data=json.dumps(state_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert state_response.status_code == 201
        created_state = json.loads(state_response.data)['data']
        state_id = created_state['state_id']
        
        # 3. Create location in the state
        location_data = {
            'country_id': country_id,
            'state_id': state_id,
            'city': 'Integration Test City',
            'postal_code': '12345'
        }
        
        location_response = client.post(
            '/api/locations',
            data=json.dumps(location_data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert location_response.status_code == 201
        created_location = json.loads(location_response.data)['data']
        location_id = created_location['location_id']
        
        # 4. Verify hierarchy by getting states for country
        states_response = client.get(f'/api/locations/states/{country_id}')
        assert states_response.status_code == 200
        states_list = json.loads(states_response.data)['data']
        state_found = any(state['state_id'] == state_id for state in states_list)
        assert state_found
        
        # 5. Update location
        location_update = {
            'city': 'Updated Integration Test City',
            'postal_code': '54321'
        }
        
        location_update_response = client.put(
            f'/api/locations/{location_id}',
            data=json.dumps(location_update),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert location_update_response.status_code == 200
        updated_location = json.loads(location_update_response.data)['data']
        assert updated_location['city'] == 'Updated Integration Test City'
        
        # 6. Clean up (delete in reverse order)
        client.delete(
            f'/api/locations/{location_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        client.delete(
            f'/api/locations/states/{state_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        client.delete(
            f'/api/locations/countries/{country_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )

class TestAuthenticationFlow:
    """Integration tests for authentication and authorization flows."""
    
    def test_authentication_required_flow(self, client):
        """Test that authentication is required for protected endpoints."""
        protected_endpoints = [
            ('POST', '/api/articles', {'title': 'Test', 'content': 'Test'}),
            ('POST', '/api/crops', {'name': 'Test Crop'}),
            ('POST', '/api/user-crops', {'crop_id': 1}),
            ('POST', '/api/categories', {'name': 'Test Category'}),
            ('POST', '/api/tags', {'name': 'test-tag'}),
            ('POST', '/api/reviews', {'expert_id': 1, 'rating': 5})
        ]
        
        for method, endpoint, data in protected_endpoints:
            if method == 'POST':
                response = client.post(
                    endpoint,
                    data=json.dumps(data),
                    content_type='application/json'
                )
            
            assert response.status_code == 401
            json_data = json.loads(response.data)
            assert json_data['success'] is False
    
    def test_admin_authorization_flow(self, client, auth_tokens):
        """Test that admin-only endpoints require admin role."""
        admin_only_endpoints = [
            ('POST', '/api/crops', {'name': 'Test Crop'}),
            ('POST', '/api/locations/countries', {'name': 'Test Country', 'code': 'TC'}),
            ('POST', '/api/categories', {'name': 'Test Category'})
        ]
        
        for method, endpoint, data in admin_only_endpoints:
            # Test with farmer token (should fail)
            if method == 'POST':
                response = client.post(
                    endpoint,
                    data=json.dumps(data),
                    content_type='application/json',
                    headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
                )
            
            assert response.status_code == 403
            
            # Test with admin token (should succeed)
            if method == 'POST':
                response = client.post(
                    endpoint,
                    data=json.dumps(data),
                    content_type='application/json',
                    headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
                )
            
            assert response.status_code in [201, 409]  # 201 for success, 409 for duplicate

class TestErrorHandling:
    """Integration tests for error handling across endpoints."""
    
    def test_validation_error_handling(self, client, auth_tokens):
        """Test validation error handling across different endpoints."""
        validation_test_cases = [
            ('POST', '/api/articles', {'title': '', 'content': 'Test'}),  # Empty title
            ('POST', '/api/crops', {'name': ''}),  # Empty name
            ('POST', '/api/categories', {'name': ''}),  # Empty name
            ('POST', '/api/tags', {'name': 'Invalid Name!'}),  # Invalid tag name
            ('POST', '/api/reviews', {'expert_id': 1, 'rating': 6})  # Invalid rating
        ]
        
        for method, endpoint, data in validation_test_cases:
            if method == 'POST':
                response = client.post(
                    endpoint,
                    data=json.dumps(data),
                    content_type='application/json',
                    headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
                )
            
            assert response.status_code == 400
            json_data = json.loads(response.data)
            assert json_data['success'] is False
            assert 'error' in json_data
    
    def test_not_found_error_handling(self, client):
        """Test 404 error handling for non-existent resources."""
        not_found_endpoints = [
            '/api/articles/99999999-9999-9999-9999-999999999999',
            '/api/crops/99999',
            '/api/categories/99999',
            '/api/tags/99999',
            '/api/reviews/99999999-9999-9999-9999-999999999999'
        ]
        
        for endpoint in not_found_endpoints:
            response = client.get(endpoint)
            assert response.status_code == 404
            json_data = json.loads(response.data)
            assert json_data['success'] is False