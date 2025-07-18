from flask import request, jsonify, current_app
from datetime import datetime
import uuid

from server.models.post import Post, Category, Tag, Comment, PostLike
from server.database import db
from server.utils.auth import token_required

def get_posts():
    """
    Get paginated posts with agricultural filters.
    
    Query Parameters:
    - page: int (default=1)
    - per_page: int (default=10)
    - category_id: int
    - crop_id: int
    - location_id: int
    - season: string (spring, summer, fall, winter)
    - search: string
    - sort_by: string (date, popularity, relevance)
    """
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_id = request.args.get('category_id', type=int)
    crop_id = request.args.get('crop_id', type=int)
    location_id = request.args.get('location_id', type=int)
    season = request.args.get('season')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'date')
    
    # Base query
    query = Post.query.filter_by(status='published')
    
    # Apply filters
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if crop_id:
        query = query.filter(Post.related_crops.contains([crop_id]))
    
    if location_id:
        query = query.filter(Post.applicable_locations.contains([location_id]))
    
    if season:
        query = query.filter_by(season_relevance=season)
    
    if search:
        query = query.filter(
            (Post.title.ilike(f'%{search}%')) | 
            (Post.content.ilike(f'%{search}%')) |
            (Post.excerpt.ilike(f'%{search}%'))
        )
    
    # Apply sorting
    if sort_by == 'date':
        query = query.order_by(Post.published_at.desc())
    elif sort_by == 'popularity':
        query = query.order_by(Post.view_count.desc())
    
    # Paginate results
    posts_page = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    posts = []
    for post in posts_page.items:
        post_dict = post.to_dict(include_content=False)
        
        # Add comment and like counts
        post_dict['comment_count'] = Comment.query.filter_by(post_id=post.post_id).count()
        post_dict['like_count'] = PostLike.query.filter_by(post_id=post.post_id).count()
        
        posts.append(post_dict)
    
    return jsonify({
        'posts': posts,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': posts_page.pages,
            'total_items': posts_page.total
        }
    }), 200


@token_required
def create_post(current_user):
    """
    Create a new post with agricultural context.
    
    Request Body:
    {
        "title": "Best Practices for Organic Corn Farming",
        "content": "Full content here...",
        "excerpt": "Learn how to maximize your organic corn yield...",
        "category_id": 1,
        "related_crops": [1, 3],
        "applicable_locations": [5, 8],
        "season_relevance": "spring",
        "tags": ["organic", "corn", "fertilizer"],
        "status": "published"
    }
    """
    data = request.get_json()
    
    # Create post
    post = Post(
        title=data.get('title'),
        content=data.get('content'),
        excerpt=data.get('excerpt'),
        author_id=current_user.user_id,
        category_id=data.get('category_id'),
        related_crops=data.get('related_crops'),
        related_livestock=data.get('related_livestock'),
        applicable_locations=data.get('applicable_locations'),
        season_relevance=data.get('season_relevance'),
        status=data.get('status', 'draft')
    )
    
    # Set published_at if status is published
    if post.status == 'published':
        post.published_at = datetime.utcnow()
    
    # Add post to database
    db.session.add(post)
    db.session.flush()  # Get post_id without committing
    
    # Add tags if provided
    if 'tags' in data and data['tags']:
        for tag_name in data['tags']:
            # Check if tag exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                # Create new tag
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()
            
            # Add tag to post
            post.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Post created successfully',
        'post': post.to_dict()
    }), 201


def get_post(post_id):
    """
    Get a single post with full details.
    """
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    # Increment view count
    post.view_count += 1
    db.session.commit()
    
    # Get post data
    post_data = post.to_dict()
    
    # Add comments
    comments = Comment.query.filter_by(post_id=post_id, parent_comment_id=None).all()
    post_data['comments'] = [comment.to_dict() for comment in comments]
    
    # Add like count
    post_data['like_count'] = PostLike.query.filter_by(post_id=post_id).count()
    
    return jsonify(post_data), 200


@token_required
def update_post(current_user, post_id):
    """
    Update an existing post.
    
    Request Body:
    {
        "title": "Updated: Best Practices for Organic Corn Farming",
        "content": "Updated content here...",
        ...other fields to update...
    }
    """
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    # Check if user is author or admin
    if post.author_id != current_user.user_id and current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update basic fields
    for field in ['title', 'content', 'excerpt', 'category_id', 
                 'related_crops', 'related_livestock', 'applicable_locations',
                 'season_relevance', 'status']:
        if field in data:
            setattr(post, field, data[field])
    
    # Update published_at if status changed to published
    if 'status' in data and data['status'] == 'published' and not post.published_at:
        post.published_at = datetime.utcnow()
    
    # Update featured image if provided
    if 'featured_image_url' in data:
        post.featured_image_url = data['featured_image_url']
    
    # Update tags if provided
    if 'tags' in data:
        # Clear existing tags
        post.tags = []
        
        # Add new tags
        for tag_name in data['tags']:
            # Check if tag exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                # Create new tag
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()
            
            # Add tag to post
            post.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Post updated successfully',
        'post': post.to_dict()
    }), 200


@token_required
def delete_post(current_user, post_id):
    """
    Delete (archive) a post.
    """
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    # Check if user is author or admin
    if post.author_id != current_user.user_id and current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Soft delete (archive) the post
    post.status = 'archived'
    db.session.commit()
    
    return jsonify({'message': 'Post archived successfully'}), 200


@token_required
def add_comment(current_user, post_id):
    """
    Add a comment to a post.
    
    Request Body:
    {
        "content": "Great post! I've been using this method...",
        "parent_comment_id": null  # Optional, for replies
    }
    """
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    data = request.get_json()
    
    # Create comment
    comment = Comment(
        post_id=post_id,
        user_id=current_user.user_id,
        content=data.get('content'),
        parent_comment_id=data.get('parent_comment_id')
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'message': 'Comment added successfully',
        'comment': comment.to_dict()
    }), 201


@token_required
def toggle_like(current_user, post_id):
    """
    Toggle like on a post.
    """
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'message': 'Post not found'}), 404
    
    # Check if user already liked the post
    like = PostLike.query.filter_by(post_id=post_id, user_id=current_user.user_id).first()
    
    if like:
        # Unlike
        db.session.delete(like)
        db.session.commit()
        return jsonify({'message': 'Post unliked successfully'}), 200
    else:
        # Like
        like = PostLike(post_id=post_id, user_id=current_user.user_id)
        db.session.add(like)
        db.session.commit()
        return jsonify({'message': 'Post liked successfully'}), 201