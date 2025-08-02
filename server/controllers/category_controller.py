from flask import request, jsonify
from sqlalchemy.orm import joinedload

from server.models.post import Category, Tag
from server.database import db
from server.utils.auth import token_required

def get_categories():
    """
    Get all categories with optional filtering.
    
    Query Parameters:
    - agricultural_only: boolean (true/false)
    - parent_id: integer (to get subcategories)
    """
    # Get query parameters
    agricultural_only = request.args.get('agricultural_only', 'false').lower() == 'true'
    parent_id = request.args.get('parent_id', type=int)
    
    # Base query
    query = Category.query
    
    # Apply filters
    if agricultural_only:
        query = query.filter_by(is_agricultural_specific=True)
    
    if parent_id is not None:
        query = query.filter_by(parent_category_id=parent_id)
    else:
        # If no parent_id specified, get top-level categories
        query = query.filter(Category.parent_category_id.is_(None))
    
    # Order by name
    categories = query.order_by(Category.name).all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories]
    }), 200


@token_required
def create_category(current_user):
    """
    Create a new category (admin only).
    
    Request Body:
    {
        "name": "Sustainable Farming",
        "description": "Practices for sustainable agriculture",
        "icon_url": "https://example.com/icon.png",
        "parent_category_id": 1,
        "is_agricultural_specific": true
    }
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'message': 'Category name is required'}), 400
    
    # Check if category already exists
    existing_category = Category.query.filter_by(name=data.get('name')).first()
    if existing_category:
        return jsonify({'message': 'Category with this name already exists'}), 409
    
    # Validate parent category if provided
    if data.get('parent_category_id'):
        parent_category = Category.query.get(data.get('parent_category_id'))
        if not parent_category:
            return jsonify({'message': 'Parent category not found'}), 404
    
    # Create category
    category = Category(
        name=data.get('name'),
        description=data.get('description'),
        icon_url=data.get('icon_url'),
        parent_category_id=data.get('parent_category_id'),
        is_agricultural_specific=data.get('is_agricultural_specific', True)
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201


def get_category(category_id):
    """
    Get a specific category with its subcategories.
    """
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    # Get category data
    category_data = category.to_dict()
    
    # Add subcategories
    subcategories = Category.query.filter_by(parent_category_id=category_id).order_by(Category.name).all()
    category_data['subcategories'] = [sub.to_dict() for sub in subcategories]
    
    return jsonify(category_data), 200


@token_required
def update_category(current_user, category_id):
    """
    Update a category (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check for name conflicts if name is being updated
    if 'name' in data and data['name'] != category.name:
        existing_category = Category.query.filter_by(name=data.get('name')).first()
        if existing_category:
            return jsonify({'message': 'Category with this name already exists'}), 409
    
    # Validate parent category if being updated
    if 'parent_category_id' in data and data['parent_category_id']:
        if data['parent_category_id'] == category_id:
            return jsonify({'message': 'Category cannot be its own parent'}), 400
        
        parent_category = Category.query.get(data.get('parent_category_id'))
        if not parent_category:
            return jsonify({'message': 'Parent category not found'}), 404
    
    # Update fields
    for field in ['name', 'description', 'icon_url', 'parent_category_id', 'is_agricultural_specific']:
        if field in data:
            setattr(category, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Category updated successfully',
        'category': category.to_dict()
    }), 200


@token_required
def delete_category(current_user, category_id):
    """
    Delete a category (admin only). Force delete removes all related data.
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    category = Category.query.get(category_id)
    
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    
    try:
        # Get force parameter
        force = request.args.get('force', 'false').lower() == 'true'
        
        if not force:
            # Check if category has subcategories
            subcategory_count = Category.query.filter_by(parent_category_id=category_id).count()
            if subcategory_count > 0:
                return jsonify({
                    'message': f'Cannot delete category. It has {subcategory_count} subcategories. Use force=true to delete anyway.',
                    'subcategories': subcategory_count
                }), 409
            
            # Check if category is being used by posts or articles
            from server.models.post import Post
            from server.models.article import Article
            
            post_count = Post.query.filter_by(category_id=category_id).count()
            article_count = Article.query.filter_by(category_id=category_id).count()
            
            if post_count > 0 or article_count > 0:
                return jsonify({
                    'message': f'Cannot delete category. It is being used by {post_count} posts and {article_count} articles. Use force=true to delete anyway.',
                    'posts': post_count,
                    'articles': article_count
                }), 409
        
        else:
            # Force delete - remove all related data
            from server.models.post import Post
            from server.models.article import Article
            
            # Update posts to remove category reference
            Post.query.filter_by(category_id=category_id).update({'category_id': None})
            
            # Update articles to remove category reference
            Article.query.filter_by(category_id=category_id).update({'category_id': None})
            
            # Delete subcategories
            Category.query.filter_by(parent_category_id=category_id).delete()
        
        # Delete the category
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({'message': 'Category deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting category {category_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete category'}), 500


# Tag Management Functions

def get_tags():
    """
    Get all tags with optional filtering.
    
    Query Parameters:
    - category: string (crop, technique, season, problem, solution)
    - search: string
    """
    # Get query parameters
    category = request.args.get('category', type=str)
    search = request.args.get('search')
    
    # Base query
    query = Tag.query
    
    # Apply filters
    if category:
        query = query.filter_by(category=category)
    
    if search:
        query = query.filter(Tag.name.ilike(f'%{search}%'))
    
    # Order by name
    tags = query.order_by(Tag.name).all()
    
    return jsonify({
        'tags': [tag.to_dict() for tag in tags]
    }), 200


@token_required
def create_tag(current_user):
    """
    Create a new tag (authenticated users).
    
    Request Body:
    {
        "name": "organic",
        "category": "technique"
    }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Validate required fields
    if not data.get('name'):
        return jsonify({'message': 'Tag name is required'}), 400
    
    # Normalize tag name (lowercase, strip whitespace)
    tag_name = data.get('name').strip().lower()
    
    # Check if tag already exists
    existing_tag = Tag.query.filter_by(name=tag_name).first()
    if existing_tag:
        return jsonify({'message': 'Tag with this name already exists'}), 409
    
    # Create tag
    tag = Tag(
        name=tag_name,
        category=data.get('category')
    )
    
    db.session.add(tag)
    db.session.commit()
    
    return jsonify({
        'message': 'Tag created successfully',
        'tag': tag.to_dict()
    }), 201


def get_tag(tag_id):
    """
    Get a specific tag.
    """
    tag = Tag.query.get(tag_id)
    
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404
    
    return jsonify(tag.to_dict()), 200


@token_required
def update_tag(current_user, tag_id):
    """
    Update a tag (admin only).
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    tag = Tag.query.get(tag_id)
    
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check for name conflicts if name is being updated
    if 'name' in data and data['name'] != tag.name:
        tag_name = data.get('name').strip().lower()
        existing_tag = Tag.query.filter_by(name=tag_name).first()
        if existing_tag:
            return jsonify({'message': 'Tag with this name already exists'}), 409
        tag.name = tag_name
    
    # Update category if provided
    if 'category' in data:
        tag.category = data.get('category')
    
    db.session.commit()
    
    return jsonify({
        'message': 'Tag updated successfully',
        'tag': tag.to_dict()
    }), 200


@token_required
def delete_tag(current_user, tag_id):
    """
    Delete a tag (admin only). Force delete removes tag from all posts and articles.
    """
    # Check if user is admin
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
    
    tag = Tag.query.get(tag_id)
    
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404
    
    try:
        # Get force parameter
        force = request.args.get('force', 'false').lower() == 'true'
        
        if not force:
            # Check if tag is being used by posts or articles
            from server.models.post import Post
            from server.models.article import Article
            
            post_count = db.session.query(Post).filter(Post.tags.contains(tag)).count()
            article_count = db.session.query(Article).filter(Article.tags.contains(tag)).count()
            
            if post_count > 0 or article_count > 0:
                return jsonify({
                    'message': f'Cannot delete tag. It is being used by {post_count} posts and {article_count} articles. Use force=true to delete anyway.',
                    'posts': post_count,
                    'articles': article_count
                }), 409
        
        else:
            # Force delete - remove tag from all posts and articles
            from server.models.post import Post
            from server.models.article import Article
            
            # Remove tag from all posts
            posts_with_tag = db.session.query(Post).filter(Post.tags.contains(tag)).all()
            for post in posts_with_tag:
                post.tags.remove(tag)
            
            # Remove tag from all articles
            articles_with_tag = db.session.query(Article).filter(Article.tags.contains(tag)).all()
            for article in articles_with_tag:
                article.tags.remove(tag)
        
        # Delete the tag
        db.session.delete(tag)
        db.session.commit()
        
        return jsonify({'message': 'Tag deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting tag {tag_id}: {str(e)}")
        return jsonify({'message': 'Failed to delete tag'}), 500