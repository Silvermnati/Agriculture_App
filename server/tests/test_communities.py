import json
import pytest

def test_get_communities(client, auth_tokens):
    """Test getting communities."""
    # Send request
    response = client.get(
        '/api/communities',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'communities' in json_data
    assert isinstance(json_data['communities'], list)
    assert len(json_data['communities']) > 0
    assert 'pagination' in json_data

def test_create_community(client, auth_tokens):
    """Test creating a community."""
    # Create test data
    data = {
        'name': 'New Test Community',
        'description': 'A new test community for farmers',
        'community_type': 'Crop-Specific',
        'focus_crops': ['Rice', 'Beans'],
        'location_city': 'New City',
        'location_country': 'Test Country',
        'is_private': False
    }
    
    # Send request
    response = client.post(
        '/api/communities',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Community created successfully'
    assert 'community' in json_data
    assert json_data['community']['name'] == 'New Test Community'
    
    # Store community ID for later tests
    community_id = json_data['community']['community_id']
    
    # Verify community was created
    response = client.get(
        f'/api/communities/{community_id}',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['name'] == 'New Test Community'
    assert json_data['description'] == 'A new test community for farmers'
    assert json_data['community_type'] == 'Crop-Specific'
    assert 'Rice' in json_data['focus_crops']
    assert 'Beans' in json_data['focus_crops']

def test_get_community(client, auth_tokens, test_community):
    """Test getting a specific community."""
    # Send request
    response = client.get(
        f'/api/communities/{test_community["community_id"]}',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert json_data['name'] == test_community['name']
    assert 'description' in json_data
    assert 'is_member' in json_data
    assert json_data['is_member'] == True  # The farmer is a member of the test community

def test_update_community(client, auth_tokens, test_community):
    """Test updating a community."""
    # Create test data
    data = {
        'name': 'Updated Test Community',
        'description': 'An updated test community for farmers'
    }
    
    # Send request
    response = client.put(
        f'/api/communities/{test_community["community_id"]}',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Community updated successfully'
    
    # Verify community was updated
    response = client.get(
        f'/api/communities/{test_community["community_id"]}',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    json_data = json.loads(response.data)
    assert json_data['name'] == 'Updated Test Community'
    assert json_data['description'] == 'An updated test community for farmers'

def test_join_community(client, auth_tokens, test_community):
    """Test joining a community."""
    # Send request as expert (who is not yet a member)
    response = client.post(
        f'/api/communities/{test_community["community_id"]}/join',
        headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert 'Successfully joined community' in json_data['message']
    
    # Verify expert is now a member
    response = client.get(
        f'/api/communities/{test_community["community_id"]}',
        headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}
    )
    
    json_data = json.loads(response.data)
    assert json_data['is_member'] == True

def test_get_community_posts(client, auth_tokens, test_community):
    """Test getting posts for a community."""
    # Send request
    response = client.get(
        f'/api/communities/{test_community["community_id"]}/posts',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'posts' in json_data
    assert isinstance(json_data['posts'], list)
    assert len(json_data['posts']) > 0
    assert 'pagination' in json_data

def test_create_community_post(client, auth_tokens, test_community):
    """Test creating a post in a community."""
    # Create test data
    data = {
        'content': 'This is a new test post',
        'image_url': 'https://example.com/new-image.jpg'
    }
    
    # Send request
    response = client.post(
        f'/api/communities/{test_community["community_id"]}/posts',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    # Check response
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Post created successfully'
    assert 'post' in json_data
    assert json_data['post']['content'] == 'This is a new test post'
    
    # Store post ID for later tests
    post_id = json_data['post']['post_id']
    
    # Verify post was created
    response = client.get(
        f'/api/communities/{test_community["community_id"]}/posts',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    json_data = json.loads(response.data)
    posts = json_data['posts']
    found = False
    for post in posts:
        if post['post_id'] == post_id:
            found = True
            assert post['content'] == 'This is a new test post'
            assert post['image_url'] == 'https://example.com/new-image.jpg'
    assert found

def test_post_interactions(client, auth_tokens, test_community, test_post):
    """Test post interactions (like, comment)."""
    # Test liking a post
    response = client.post(
        f'/api/communities/{test_community["community_id"]}/posts/{test_post["post_id"]}/like',
        headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}
    )
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'liked' in json_data
    assert json_data['liked'] == True
    
    # Test adding a comment
    data = {
        'content': 'This is a test comment'
    }
    
    response = client.post(
        f'/api/communities/{test_community["community_id"]}/posts/{test_post["post_id"]}/comments',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}
    )
    
    assert response.status_code == 201
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Comment added successfully'
    assert 'comment' in json_data
    assert json_data['comment']['content'] == 'This is a test comment'
    
    # Store comment ID
    comment_id = json_data['comment']['comment_id']
    
    # Test getting comments
    response = client.get(
        f'/api/communities/{test_community["community_id"]}/posts/{test_post["post_id"]}/comments',
        headers={'Authorization': f'Bearer {auth_tokens["farmer"]}'}
    )
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'comments' in json_data
    assert isinstance(json_data['comments'], list)
    assert len(json_data['comments']) > 0
    
    # Test updating a comment
    data = {
        'content': 'This is an updated test comment'
    }
    
    response = client.put(
        f'/api/communities/{test_community["community_id"]}/posts/{test_post["post_id"]}/comments/{comment_id}',
        data=json.dumps(data),
        content_type='application/json',
        headers={'Authorization': f'Bearer {auth_tokens["expert"]}'}
    )
    
    assert response.status_code == 200
    json_data = json.loads(response.data)
    assert 'message' in json_data
    assert json_data['message'] == 'Comment updated successfully'