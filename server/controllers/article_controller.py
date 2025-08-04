from flask import request, jsonify, current_app
from datetime import datetime
import json
import uuid, math, os
from sqlalchemy import func, any_, case, column
from werkzeug.utils import secure_filename
import bleach
from sqlalchemy.orm import joinedload, subqueryload, aliased

from server.models.article import Article
from server.models.post import Category, Tag
from server.database import db
from server.utils.auth import token_required

def get_articles():
    """
    Get paginated articles with agricultural filters.
    
    Query Parameters:
    - page: int (default=1)
    - per_page: int (default=10)
    - category: string
    - crop: string
    - season: string (spring, summer, fall, winter)
    - search: string
    - sort_by: string (date, popularity, relevance)
    - status: string (published, draft, archived) - admin only
    """
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    category_name = request.args.get('category', type=str)
    crops = request.args.get('crop', type=str)
    season = request.args.get('season', type=str)
    locations = request.args.get('location', type=str)
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'date')
    status = request.args.get('status', 'published')
    
    # Base query with eager loading
    query = Article.query.options(
        joinedload(Article.author),
        joinedload(Article.category),
        subqueryload(Article.tags)
    )
    
    # Filter by status (only published for non-admin users)
    if status != 'published':
        # TODO: Add admin check when auth is enhanced
        query = query.filter(Article.status == 'published')
    else:
        query = query.filter(Article.status == status)
    
    # Apply filters
    if category_name:
        query = query.filter(Article.category.has(Category.name.ilike(f'%{category_name}%')))
       
    if crops:
        crop_list = [c.strip() for c in crops.split(',') if c.strip()]
        if crop_list:
            query = query.filter(Article.related_crops.op('&&')(crop_list))
    
    if season:
        query = query.filter_by(season_relevance=season)
        
    if locations:
        location_list = [l.strip() for l in locations.split(',') if l.strip()]
        if location_list:
            query = query.filter(Article.applicable_locations.op('&&')(location_list))
    
    if search:
        query = query.filter(
            (Article.title.ilike(f'%{search}%')) | 
            (Article.content.ilike(f'%{search}%'))
        )
    
    # Apply sorting
    if sort_by == 'date':
        query = query.order_by(Article.published_at.desc())
    elif sort_by == 'popularity':
        query = query.order_by(Article.view_count.desc())
    
    # Paginate results
    articles_page = query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Format response
    articles = []
    for article in articles_page.items:
        article_dict = article.to_dict()
        # Don't include full content in list view
        article_dict.pop('content', None)
        articles.append(article_dict)
    
    return jsonify({
        'articles': articles,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': articles_page.pages,
            'total_items': articles_page.total
        }
    }), 200


@token_required
def create_article(current_user):
    """
    Create a new article with agricultural context.
    
    Request Body:
    {
        "title": "Best Practices for Organic Corn Farming",
        "content": "Full content here...",
        "excerpt": "Learn how to maximize your organic corn yield...",
        "category_id": 1,
        "related_crops": ["corn", "maize"],
        "applicable_locations": ["nairobi", "nakuru"],
        "season_relevance": "spring",
        "tags": ["organic", "corn", "fertilizer"],
        "status": "published",
        "featured_image_url": "https://example.com/image.jpg"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['title', 'content']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field} is required'}), 400
    
    # Validate category if provided
    category = None
    if data.get('category_id'):
        category = Category.query.get(data.get('category_id'))
        if not category:
            return jsonify({'message': f"Category with id {data.get('category_id')} not found"}), 400

    # Security: Sanitize HTML content to prevent XSS
    allowed_tags = ['p', 'b', 'i', 'u', 'ol', 'ul', 'li', 'a', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'img', 'blockquote']
    allowed_attrs = {
        '*': ['class'],
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'width', 'height']
    }
    
    content = data.get('content', '')
    sanitized_content = bleach.clean(content, tags=allowed_tags, attributes=allowed_attrs)

    # Calculate read time
    word_count = len(bleach.clean(content, tags=[], strip=True).split())
    read_time_minutes = math.ceil(word_count / 200)
    
    # Create article
    article = Article(
        title=data.get('title'),
        content=sanitized_content,
        excerpt=data.get('excerpt'),
        author_id=current_user.user_id,
        category_id=category.category_id if category else None,
        related_crops=data.get('related_crops', []),
        applicable_locations=data.get('applicable_locations', []),
        season_relevance=data.get('season_relevance'),
        status=data.get('status', 'draft'),
        featured_image_url=data.get('featured_image_url'),
        read_time=read_time_minutes
    )
    
    # Set published_at if status is published
    if article.status == 'published':
        article.published_at = datetime.utcnow()
    
    # Add article to database
    db.session.add(article)
    db.session.flush()  # Get article_id without committing
    
    # Add tags if provided
    tags_list = data.get('tags', [])
    if tags_list:
        for tag_name in tags_list:
            # Check if tag exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                # Create new tag
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()
            
            # Add tag to article
            article.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Article created successfully',
        'article': article.to_dict()
    }), 201


def get_article(article_id):
    """
    Get a single article with full details.
    """
    article = Article.query.options(
        joinedload(Article.author),
        joinedload(Article.category),
        joinedload(Article.tags)
    ).filter_by(article_id=article_id).first()

    if not article:
        return jsonify({'message': 'Article not found'}), 404

    # Only show published articles to non-authenticated users
    # TODO: Add proper auth check for draft articles
    if article.status != 'published':
        return jsonify({'message': 'Article not found'}), 404

    # Increment view count
    article.view_count += 1
    db.session.commit()

    return jsonify(article.to_dict()), 200


@token_required
def update_article(current_user, article_id):
    """
    Update an existing article.
    
    Request Body:
    {
        "title": "Updated: Best Practices for Organic Corn Farming",
        "content": "Updated content here...",
        ...other fields to update...
    }
    """
    article = Article.query.get(article_id)
    
    if not article:
        return jsonify({'message': 'Article not found'}), 404
    
    # Check if user is author or admin
    if article.author_id != current_user.user_id and current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    # Validate category if provided
    if 'category_id' in data and data['category_id']:
        category = Category.query.get(data.get('category_id'))
        if not category:
            return jsonify({'message': f"Category with id {data.get('category_id')} not found"}), 400
        article.category_id = category.category_id

    # Security: Sanitize HTML content
    if 'content' in data:
        allowed_tags = ['p', 'b', 'i', 'u', 'ol', 'ul', 'li', 'a', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'img', 'blockquote']
        allowed_attrs = {'*': ['class'], 'a': ['href', 'title'], 'img': ['src', 'alt', 'width', 'height']}
        article.content = bleach.clean(data['content'], tags=allowed_tags, attributes=allowed_attrs)
        # Recalculate read time if content changes
        word_count = len(bleach.clean(data['content'], tags=[], strip=True).split())
        article.read_time = math.ceil(word_count / 200)

    # Update basic fields
    for field in ['title', 'excerpt', 'season_relevance', 'status', 'featured_image_url']:
        if field in data:
            setattr(article, field, data[field])

    # Update array fields
    if 'related_crops' in data:
        article.related_crops = data.get('related_crops', [])
    if 'applicable_locations' in data:
        article.applicable_locations = data.get('applicable_locations', [])
    
    # Update published_at if status changed to published
    if 'status' in data and data['status'] == 'published' and not article.published_at:
        article.published_at = datetime.utcnow()
    
    # Update tags if provided
    if 'tags' in data:
        tags_list = data.get('tags', [])
        # Clear existing tags
        article.tags = []
        
        # Add new tags
        for tag_name in tags_list:
            # Check if tag exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                # Create new tag
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.flush()
            
            # Add tag to article
            article.tags.append(tag)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Article updated successfully',
        'article': article.to_dict()
    }), 200


@token_required
def delete_article(current_user, article_id):
    """
    Delete an article. Admins can hard delete, users can only archive their own articles.
    """
    try:
        article = Article.query.get(article_id)
        
        if not article:
            return jsonify({'message': 'Article not found'}), 404
        
        # Check permissions
        is_admin = current_user.role == 'admin'
        is_author = article.author_id == current_user.user_id
        
        if not is_admin and not is_author:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Admin hard delete - completely remove article
        if is_admin:
            db.session.delete(article)
            db.session.commit()
            return jsonify({'message': 'Article permanently deleted successfully'}), 200
        
        # User soft delete (archive) their own article
        else:
            article.status = 'archived'
            db.session.commit()
            return jsonify({'message': 'Article archived successfully'}), 200
            
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting article {article_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete article'}), 500