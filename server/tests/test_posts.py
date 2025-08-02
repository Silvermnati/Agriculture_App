import pytest
import json
from server.models.post import Post, Tag, Category
from server.models.user import User
from server.database import db


def test_get_posts_with_tag_filter(client, auth_headers):
    """Test getting posts filtered by tags (case-insensitive)."""
    
    # Create a test user
    user = User(
        email='testuser@example.com',
        first_name='Test',
        last_name='User',
        phone_number='1234567890',
        role='farmer'
    )
    user.set_password('testpassword')
    db.session.add(user)
    db.session.commit()
    
    # Create a test category
    category = Category(name='Test Category', description='Test Description')
    db.session.add(category)
    db.session.commit()
    
    # Create test tags with different cases
    tag1 = Tag(name='Organic Farming')  # Capital case
    tag2 = Tag(name='soil health')      # Lower case
    tag3 = Tag(name='Water Management') # Mixed case
    
    db.session.add_all([tag1, tag2, tag3])
    db.session.commit()
    
    # Create test posts
    post1 = Post(
        title='Organic Farming Guide',
        content='Content about organic farming',
        excerpt='Excerpt about organic farming',
        author_id=user.user_id,
        category_id=category.category_id,
        status='published'
    )
    post1.tags.append(tag1)
    
    post2 = Post(
        title='Soil Health Tips',
        content='Content about soil health',
        excerpt='Excerpt about soil health',
        author_id=user.user_id,
        category_id=category.category_id,
        status='published'
    )
    post2.tags.append(tag2)
    
    post3 = Post(
        title='Water Management Techniques',
        content='Content about water management',
        excerpt='Excerpt about water management',
        author_id=user.user_id,
        category_id=category.category_id,
        status='published'
    )
    post3.tags.append(tag3)
    
    db.session.add_all([post1, post2, post3])
    db.session.commit()
    
    # Test case-insensitive filtering
    
    # Test 1: Filter by "organic farming" (lowercase) should match "Organic Farming"
    response = client.get('/api/posts?tags=organic farming')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['posts']) == 1
    assert data['posts'][0]['title'] == 'Organic Farming Guide'
    
    # Test 2: Filter by "SOIL HEALTH" (uppercase) should match "soil health"
    response = client.get('/api/posts?tags=SOIL HEALTH')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['posts']) == 1
    assert data['posts'][0]['title'] == 'Soil Health Tips'
    
    # Test 3: Filter by "water" (partial match) should match "Water Management"
    response = client.get('/api/posts?tags=water')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['posts']) == 1
    assert data['posts'][0]['title'] == 'Water Management Techniques'
    
    # Test 4: Filter by non-existent tag should return no posts
    response = client.get('/api/posts?tags=nonexistent')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['posts']) == 0


def test_get_posts_without_tag_filter(client, auth_headers):
    """Test getting all posts when no tag filter is applied."""
    
    response = client.get('/api/posts')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'posts' in data
    # Should return all published posts