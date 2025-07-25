import json
import pytest
from server.models.post import Category, Tag
from server.database import db

def test_get_categories(client):
    """Test getting list of categories."""
    response = client.get('/api/categories')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data
    assert len(json_data['data']) > 0

def test_create_category_admin(client, auth_tokens):
    """Test creating category as admin."""
    data = {
        'name': 'Test Category',
        'description': 'A test category for testing',
        'is_agricultural_specific': True
    }
    
    response = client.post(
        '/api/categories',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert json_data['data']['name'] == 'Test Category'

def test_create_category_non_admin(client, auth_tokens):
    """Test creating category as non-admin."""
    data = {
        'name': 'Test Category',
        'description': 'A test category for testing'
    }
    
    response = client.post(
        '/api/categories',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 403

def test_get_single_category(client, app):
    """Test getting a single category."""
    with app.app_context():
        category = Category.query.first()
        
        response = client.get(f'/api/categories/{category.category_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['category_id'] == category.category_id

def test_get_nonexistent_category(client):
    """Test getting non-existent category."""
    response = client.get('/api/categories/99999')
    
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_update_category_admin(client, auth_tokens, app):
    """Test updating category as admin."""
    with app.app_context():
        category = Category(
            name='Original Category',
            description='Original description',
            is_agricultural_specific=False
        )
        db.session.add(category)
        db.session.commit()
        
        data = {
            'name': 'Updated Category',
            'description': 'Updated description',
            'is_agricultural_specific': True
        }
        
        response = client.put(
            f'/api/categories/{category.category_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'Updated Category'

def test_delete_category_admin(client, auth_tokens, app):
    """Test deleting category as admin."""
    with app.app_context():
        category = Category(
            name='Category to Delete',
            description='This category will be deleted',
            is_agricultural_specific=False
        )
        db.session.add(category)
        db.session.commit()
        
        response = client.delete(
            f'/api/categories/{category.category_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_create_duplicate_category(client, auth_tokens, app):
    """Test creating duplicate category."""
    with app.app_context():
        existing_category = Category.query.first()
        
        data = {
            'name': existing_category.name,
            'description': 'Duplicate category'
        }
        
        response = client.post(
            '/api/categories',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 409  # Conflict

# Tag Tests

def test_get_tags(client):
    """Test getting list of tags."""
    response = client.get('/api/tags')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data

def test_get_tags_with_filters(client):
    """Test getting tags with filters."""
    response = client.get('/api/tags?search=farm')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True

def test_create_tag_authenticated(client, auth_tokens):
    """Test creating tag as authenticated user."""
    data = {
        'name': 'test-tag',
        'description': 'A test tag'
    }
    
    response = client.post(
        '/api/tags',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert json_data['data']['name'] == 'test-tag'

def test_create_tag_unauthenticated(client):
    """Test creating tag without authentication."""
    data = {
        'name': 'test-tag',
        'description': 'A test tag'
    }
    
    response = client.post(
        '/api/tags',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    assert response.status_code == 401

def test_get_single_tag(client, app):
    """Test getting a single tag."""
    with app.app_context():
        tag = Tag(name='test-tag', description='Test tag')
        db.session.add(tag)
        db.session.commit()
        
        response = client.get(f'/api/tags/{tag.tag_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'test-tag'

def test_update_tag_admin(client, auth_tokens, app):
    """Test updating tag as admin."""
    with app.app_context():
        tag = Tag(name='original-tag', description='Original description')
        db.session.add(tag)
        db.session.commit()
        
        data = {
            'name': 'updated-tag',
            'description': 'Updated description'
        }
        
        response = client.put(
            f'/api/tags/{tag.tag_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['name'] == 'updated-tag'

def test_update_tag_non_admin(client, auth_tokens, app):
    """Test updating tag as non-admin."""
    with app.app_context():
        tag = Tag(name='original-tag', description='Original description')
        db.session.add(tag)
        db.session.commit()
        
        data = {
            'name': 'updated-tag',
            'description': 'Updated description'
        }
        
        response = client.put(
            f'/api/tags/{tag.tag_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 403

def test_delete_tag_admin(client, auth_tokens, app):
    """Test deleting tag as admin."""
    with app.app_context():
        tag = Tag(name='tag-to-delete', description='This tag will be deleted')
        db.session.add(tag)
        db.session.commit()
        
        response = client.delete(
            f'/api/tags/{tag.tag_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_create_invalid_tag_name(client, auth_tokens):
    """Test creating tag with invalid name."""
    data = {
        'name': 'Invalid Tag Name!',  # Contains invalid characters
        'description': 'Invalid tag'
    }
    
    response = client.post(
        '/api/tags',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 400
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_create_duplicate_tag(client, auth_tokens, app):
    """Test creating duplicate tag."""
    with app.app_context():
        existing_tag = Tag(name='existing-tag', description='Existing tag')
        db.session.add(existing_tag)
        db.session.commit()
        
        data = {
            'name': 'existing-tag',
            'description': 'Duplicate tag'
        }
        
        response = client.post(
            '/api/tags',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 409  # Conflict