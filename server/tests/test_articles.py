import json
import pytest
from flask import url_for
from server.models.article import Article
from server.models.post import Category, Tag
from server.models.user import User
from server.database import db

def test_get_articles_list(client, auth_tokens):
    """Test getting list of articles."""
    response = client.get('/api/articles')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert 'data' in json_data
    assert 'pagination' in json_data

def test_get_articles_with_filters(client, auth_tokens):
    """Test getting articles with filters."""
    response = client.get('/api/articles?category=1&limit=5')
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert len(json_data['data']) <= 5

def test_create_article_authenticated(client, auth_tokens):
    """Test creating article with authenticated user."""
    data = {
        'title': 'Test Article',
        'content': '<p>This is test content</p>',
        'excerpt': 'Test excerpt',
        'category_id': 1,
        'tags': ['farming', 'crops'],
        'related_crops': ['corn', 'wheat'],
        'season_relevance': 'spring',
        'status': 'published'
    }
    
    response = client.post(
        '/api/articles',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert json_data['success'] is True
    assert json_data['data']['title'] == 'Test Article'

def test_create_article_unauthenticated(client):
    """Test creating article without authentication."""
    data = {
        'title': 'Test Article',
        'content': '<p>This is test content</p>'
    }
    
    response = client.post(
        '/api/articles',
        data=json.dumps(data),
        content_type='application/json'
    )
    
    assert response.status_code == 401

def test_create_article_invalid_data(client, auth_tokens):
    """Test creating article with invalid data."""
    data = {
        'title': '',  # Empty title
        'content': '<p>This is test content</p>'
    }
    
    response = client.post(
        '/api/articles',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 400
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_get_single_article(client, app):
    """Test getting a single article."""
    with app.app_context():
        # Create test article
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='Test Article',
            content='<p>Test content</p>',
            excerpt='Test excerpt',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        response = client.get(f'/api/articles/{article.article_id}')
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['title'] == 'Test Article'

def test_get_nonexistent_article(client):
    """Test getting non-existent article."""
    response = client.get('/api/articles/99999999-9999-9999-9999-999999999999')
    
    assert response.status_code == 404
    json_data = json.loads(response.data)
    assert json_data['success'] is False

def test_update_article_owner(client, auth_tokens, app):
    """Test updating article by owner."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='Original Title',
            content='<p>Original content</p>',
            excerpt='Original excerpt',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        data = {
            'title': 'Updated Title',
            'content': '<p>Updated content</p>'
        }
        
        response = client.put(
            f'/api/articles/{article.article_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True
        assert json_data['data']['title'] == 'Updated Title'

def test_update_article_unauthorized(client, auth_tokens, app):
    """Test updating article by non-owner."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='Original Title',
            content='<p>Original content</p>',
            excerpt='Original excerpt',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        data = {
            'title': 'Updated Title',
            'content': '<p>Updated content</p>'
        }
        
        response = client.put(
            f'/api/articles/{article.article_id}',
            data=json.dumps(data),
            content_type='application/json',
            headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}  # Different user
        )
        
        assert response.status_code == 403

def test_delete_article_owner(client, auth_tokens, app):
    """Test deleting article by owner."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='To Delete',
            content='<p>Content to delete</p>',
            excerpt='Excerpt to delete',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        response = client.delete(
            f'/api/articles/{article.article_id}',
            headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_article_admin(client, auth_tokens, app):
    """Test deleting article by admin."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='To Delete by Admin',
            content='<p>Content to delete</p>',
            excerpt='Excerpt to delete',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        response = client.delete(
            f'/api/articles/{article.article_id}',
            headers={'Authorization': f'Bearer {auth_tokens["admin"]}'}
        )
        
        assert response.status_code == 200
        json_data = json.loads(response.data)
        assert json_data['success'] is True

def test_delete_article_unauthorized(client, auth_tokens, app):
    """Test deleting article by unauthorized user."""
    with app.app_context():
        user = User.query.filter_by(email='farmer@example.com').first()
        article = Article(
            title='Protected Article',
            content='<p>Protected content</p>',
            excerpt='Protected excerpt',
            author_id=user.user_id,
            status='published'
        )
        db.session.add(article)
        db.session.commit()
        
        response = client.delete(
            f'/api/articles/{article.article_id}',
            headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}  # Different user
        )
        
        assert response.status_code == 403