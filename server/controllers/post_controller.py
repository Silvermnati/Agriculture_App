from flask import request, jsonify, current_app
from datetime import datetime
import json
import uuid, math, os
from sqlalchemy import func, any_, case, column
from werkzeug.utils import secure_filename
import bleach
from sqlalchemy.orm import joinedload, subqueryload, aliased


from server.models.post import Post, Category, Tag, Comment, PostLike, post_tags
from server.database import db
from server.models.crop import Crop
from server.utils.auth import token_required

def get_posts():
    """
    Get paginated posts with agricultural filters.
    
    Query Parameters:
    - page: int (default=1)
    - per_page: int (default=10)
    - category: string
    - crop: string
    - season: string (spring, summer, fall, winter)
    - search: string
    - sort_by: string (date, popularity, relevance)
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
    
    # Base query
    # --- Performance Fix: Use subqueries to get counts and avoid N+1 queries ---
    comment_count_sq = db.session.query(
        Comment.post_id,
        func.count(Comment.comment_id).label('comment_count')
    ).group_by(Comment.post_id).subquery()


    like_count_sq = db.session.query(
        PostLike.post_id,
        func.count(PostLike.user_id).label('like_count')
    ).group_by(PostLike.post_id).subquery()


    comment_count_expr = func.coalesce(comment_count_sq.c.comment_count, 0).label('comment_count')
    like_count_expr = func.coalesce(like_count_sq.c.like_count, 0).label('like_count')

    # --- Base query with joins to subqueries and preloading of relationships ---
    query = db.session.query(
        Post,
        comment_count_expr,
        like_count_expr
    ).outerjoin(comment_count_sq, Post.post_id == comment_count_sq.c.post_id) \
     .outerjoin(like_count_sq, Post.post_id == like_count_sq.c.post_id) \
     .filter(Post.status == 'published')
    
    # Apply filters
    # --- Filtering Fix: Handle string-based filters from the frontend ---
    if category_name:
        # Use .has() to create a WHERE EXISTS subquery, which is more stable
        # with complex queries than adding another JOIN.
        query = query.filter(Post.category.has(Category.name.ilike(f'%{category_name}%')))
       
    if crops:
        # Filter out empty strings that might result from "crop1,,crop2"
        crop_list = [c.strip() for c in crops.split(',') if c.strip()]
        if crop_list:
            # Use 'overlap' (&& operator) to find posts with any of the specified crops
            query = query.filter(Post.related_crops.op('&&')(crop_list))
    
    if season:
        query = query.filter_by(season_relevance=season)
    if locations:
        # Filter out empty strings
        location_list = [l.strip() for l in locations.split(',') if l.strip()]
        if location_list:
            # Use 'overlap' (&& operator) to find posts with any of the specified locations
            query = query.filter(Post.applicable_locations.op('&&')(location_list))
    
    if search:
        query = query.filter(
            (Post.title.ilike(f'%{search}%')) | 
            (Post.content.ilike(f'%{search}%'))
        )
    
    # Apply sorting
    if sort_by == 'date':
        query = query.order_by(Post.published_at.desc())
    elif sort_by == 'popularity':
        query = query.order_by(Post.view_count.desc(), like_count_expr.desc())
    
    # --- Stability Fix: Use a "Paginate-by-IDs" approach for maximum stability ---
    # This pattern avoids complex queries with .paginate() by first paginating only the
    # primary keys and then fetching the full objects for that page.

    # 1. Create a subquery that contains all filtering and sorting, but only selects the ID and counts.
    subq = query.with_entities(
        Post.post_id,
        comment_count_expr,
        like_count_expr
    ).subquery('sorted_posts')

    # 2. Paginate this simple subquery. This is very stable and avoids the error.
    paginated_subquery = db.session.query(subq).paginate(page=page, per_page=per_page, error_out=False)

    # 3. Extract the IDs and counts for the current page into a dictionary for easy lookup.
    post_ids_on_page = [item.post_id for item in paginated_subquery.items]
    counts_map = {item.post_id: {'comment_count': item.comment_count, 'like_count': item.like_count} for item in paginated_subquery.items}

    # 4. If there are no posts on this page, return an empty list.
    if not post_ids_on_page:
        return jsonify({'posts': [], 'pagination': {'page': page, 'per_page': per_page, 'total_pages': paginated_subquery.pages, 'total_items': paginated_subquery.total}}), 200

    # 5. Fetch the full Post objects for the IDs on the current page, preserving the original sort order.
    order_logic = case({pid: i for i, pid in enumerate(post_ids_on_page)}, value=Post.post_id)
    posts_on_page = db.session.query(Post).filter(
        Post.post_id.in_(post_ids_on_page)
    ).order_by(order_logic).options(
        joinedload(Post.author),
        joinedload(Post.category),
        subqueryload(Post.tags)
    ).all()

    # 6. Format the response, combining the Post objects with their counts from the map.
    posts = []
    for post in posts_on_page:
        counts = counts_map.get(post.post_id, {})
        post_dict = post.to_dict(
            include_content=False,
            comment_count=counts.get('comment_count', 0),
            like_count=counts.get('like_count', 0)
        )
        posts.append(post_dict)
    
    return jsonify({
        'posts': posts,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginated_subquery.pages,
            'total_items': paginated_subquery.total
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
        "related_crops": ["corn", "maize"],
        "applicable_locations": ["nairobi", "nakuru"],
        "season_relevance": "spring",
        "tags": ["organic", "corn", "fertilizer"],
        "status": "published"
    }
    """
    # Handle multipart/form-data from the frontend
    data = request.form
    featured_image = request.files.get('featured_image')
    
    featured_image_url = None
    if featured_image:
        # --- Security Fix: Sanitize filename, validate extension, and ensure uniqueness ---
        filename = secure_filename(featured_image.filename)
        if filename != '':
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
            if '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions:
                # Create a unique filename to prevent overwrites
                unique_filename = str(uuid.uuid4()) + '_' + filename
                
                # In a real app with an upload folder configured:
                # upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads/images')
                # if not os.path.exists(upload_folder):
                #     os.makedirs(upload_folder)
                # file_path = os.path.join(upload_folder, unique_filename)
                # featured_image.save(file_path)
                
                featured_image_url = f"uploads/images/{unique_filename}"
            else:
                return jsonify({'message': 'Invalid file type. Allowed types are png, jpg, jpeg, gif.'}), 400

    # The frontend sends arrays as JSON strings, so we parse them.
    related_crops = json.loads(data.get('related_crops', '[]'))
    applicable_locations = json.loads(data.get('applicable_locations', '[]'))
    tags_list = json.loads(data.get('tags', '[]'))

    # --- Validation Fix: Check if category exists ---
    category = Category.query.get(data.get('category_id'))
    if not category:
        return jsonify({'message': f"Category with id {data.get('category_id')} not found"}), 400

    # --- Security Fix: Sanitize HTML content to prevent XSS ---
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
    
    # Create post
    post = Post(
        title=data.get('title'),
        content=sanitized_content,
        excerpt=data.get('excerpt'),
        author_id=current_user.user_id,
        category_id=category.category_id,
        related_crops=related_crops,
        applicable_locations=applicable_locations,
        season_relevance=data.get('season_relevance'),
        status=data.get('status', 'published'),
        featured_image_url=featured_image_url,
        read_time=read_time_minutes
    )
    
    # Set published_at if status is published
    if post.status == 'published':
        post.published_at = datetime.utcnow()
    
    # Add post to database
    db.session.add(post)
    db.session.flush()  # Get post_id without committing
    
    # Add tags if provided
    if tags_list:
        for tag_name in tags_list:
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
    Get a single post with full details, optimized to prevent N+1 queries.
    """
    # --- Performance Fix: Eager load related data in a single query ---
    post = Post.query.options(
        joinedload(Post.author),
        joinedload(Post.category),
        joinedload(Post.tags)
    ).filter_by(post_id=post_id).first()

    if not post:
        return jsonify({'message': 'Post not found'}), 404

    # Increment view count
    post.view_count += 1
    db.session.commit()

    # --- Performance Fix: Fetch all comments and build tree in memory ---
    all_comments = Comment.query.options(
        joinedload(Comment.user)
    ).filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()

    comment_map = {comment.comment_id: comment.to_dict(include_replies=False) for comment in all_comments}
    
    # Initialize replies list for each comment
    for comment_data in comment_map.values():
        comment_data['replies'] = []

    top_level_comments = []
    for comment in all_comments:
        comment_data = comment_map[comment.comment_id]
        if comment.parent_comment_id:
            parent = comment_map.get(comment.parent_comment_id)
            if parent:
                parent['replies'].append(comment_data)
        else:
            top_level_comments.append(comment_data)

    # Get like count
    like_count = PostLike.query.filter_by(post_id=post_id).count()

    # Combine all data
    post_data = post.to_dict(include_content=True)
    post_data['comments'] = top_level_comments
    post_data['like_count'] = like_count

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
    
    # --- Refactor: Handle multipart/form-data for consistency with create_post ---
    data = request.form
    featured_image = request.files.get('featured_image')

    # Handle featured image update
    if featured_image:
        filename = secure_filename(featured_image.filename)
        if filename != '':
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
            if '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions:
                unique_filename = str(uuid.uuid4()) + '_' + filename
                post.featured_image_url = f"uploads/images/{unique_filename}"
            else:
                return jsonify({'message': 'Invalid file type.'}), 400

    # --- Security & Validation Fixes ---
    if 'content' in data:
        allowed_tags = ['p', 'b', 'i', 'u', 'ol', 'ul', 'li', 'a', 'br', 'h1', 'h2', 'h3', 'strong', 'em', 'img', 'blockquote']
        allowed_attrs = {'*': ['class'], 'a': ['href', 'title'], 'img': ['src', 'alt', 'width', 'height']}
        post.content = bleach.clean(data['content'], tags=allowed_tags, attributes=allowed_attrs)
        # Recalculate read time if content changes
        word_count = len(bleach.clean(data['content'], tags=[], strip=True).split())
        post.read_time = math.ceil(word_count / 200)

    if 'category_id' in data:
        category = Category.query.get(data.get('category_id'))
        if not category:
            return jsonify({'message': f"Category with id {data.get('category_id')} not found"}), 400
        post.category_id = category.category_id

    # Update basic fields
    for field in ['title', 'excerpt', 'season_relevance', 'status']:
        if field in data:
            setattr(post, field, data[field])

    # Update array fields
    if 'related_crops' in data:
        post.related_crops = json.loads(data.get('related_crops', '[]'))
    if 'applicable_locations' in data:
        post.applicable_locations = json.loads(data.get('applicable_locations', '[]'))
    
    # Update published_at if status changed to published
    if 'status' in data and data['status'] == 'published' and not post.published_at:
        post.published_at = datetime.utcnow()
    
    # Update tags if provided
    if 'tags' in data:
        tags_list = json.loads(data.get('tags', '[]'))
        # Clear existing tags
        post.tags = []
        
        # Add new tags
        for tag_name in tags_list:
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