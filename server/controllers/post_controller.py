from flask import request, jsonify, current_app
from datetime import datetime
import json
import uuid, math, os
from sqlalchemy import func, any_, case, column
from werkzeug.utils import secure_filename
import bleach
from sqlalchemy.orm import joinedload, subqueryload, aliased


from server.models.post import Post, Category, Tag, Comment, ArticlePostLike as PostLike, post_tags
from server.database import db
from server.models.crop import Crop
from server.utils.auth import token_required, resource_owner_required, admin_required
from server.utils.validators import validate_agricultural_data, sanitize_html_content, validate_business_rules
from server.utils.error_handlers import create_error_response, create_success_response
from server.utils.rate_limiter import rate_limit_moderate, rate_limit_lenient

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
        return create_success_response(
            data=[],
            pagination={
                'page': page,
                'per_page': per_page,
                'total_pages': paginated_subquery.pages,
                'total_items': paginated_subquery.total
            }
        )

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
    
    return create_success_response(
        data=posts,
        pagination={
            'page': page,
            'per_page': per_page,
            'total_pages': paginated_subquery.pages,
            'total_items': paginated_subquery.total
        }
    )


@token_required
@rate_limit_moderate
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
    # Handle both JSON and form data
    if request.is_json:
        data = request.get_json()
        featured_image = None
    else:
        data = request.form.to_dict()
        featured_image = request.files.get('featured_image')
    
    if not data:
        return create_error_response('INVALID_REQUEST', 'Request body is required')
    
    # Parse JSON arrays from form data
    if not request.is_json:
        try:
            data['related_crops'] = json.loads(data.get('related_crops', '[]'))
            data['applicable_locations'] = json.loads(data.get('applicable_locations', '[]'))
            data['tags'] = json.loads(data.get('tags', '[]'))
        except json.JSONDecodeError:
            return create_error_response('INVALID_JSON', 'Invalid JSON in array fields')
    
    # Validate article data
    validation_result = validate_agricultural_data(data, 'article')
    if not validation_result.success:
        return validation_result.to_response()
    
    # Validate category exists
    category = Category.query.get(data.get('category_id'))
    if not category:
        return create_error_response('INVALID_REFERENCE', f"Category with id {data.get('category_id')} not found")
    
    # Handle featured image upload
    featured_image_url = None
    if featured_image:
        filename = secure_filename(featured_image.filename)
        if filename != '':
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
            if '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions:
                unique_filename = str(uuid.uuid4()) + '_' + filename
                featured_image_url = f"uploads/images/{unique_filename}"
            else:
                return create_error_response('INVALID_FILE_TYPE', 'Invalid file type. Allowed types are png, jpg, jpeg, gif, webp.')
    
    # Sanitize HTML content
    content = data.get('content', '')
    sanitized_content = sanitize_html_content(content)
    
    # Calculate read time
    word_count = len(bleach.clean(content, tags=[], strip=True).split())
    read_time_minutes = max(1, math.ceil(word_count / 200))
    
    # Create post
    post = Post(
        title=data.get('title'),
        content=sanitized_content,
        excerpt=data.get('excerpt'),
        author_id=current_user.user_id,
        category_id=category.category_id,
        related_crops=data.get('related_crops', []),
        applicable_locations=data.get('applicable_locations', []),
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
    tags_list = data.get('tags', [])
    if tags_list:
        for tag_name in tags_list:
            if tag_name.strip():  # Skip empty tags
                # Check if tag exists
                tag = Tag.query.filter_by(name=tag_name.strip()).first()
                if not tag:
                    # Create new tag
                    tag = Tag(name=tag_name.strip())
                    db.session.add(tag)
                    db.session.flush()
                
                # Add tag to post if not already added
                if tag not in post.tags:
                    post.tags.append(tag)
    
    db.session.commit()
    
    # Notify followers if post is published
    if post.status == 'published':
        try:
            from server.services.follow_service import follow_service
            follow_service.notify_followers(
                user_id=str(current_user.user_id),
                event_type='new_post',
                event_data={
                    'post_id': str(post.post_id),
                    'title': post.title,
                    'excerpt': post.excerpt
                }
            )
        except Exception as e:
            current_app.logger.error(f"Error notifying followers: {str(e)}")
            # Don't fail the post creation if notification fails
    
    return create_success_response(
        data={'post': post.to_dict()},
        message='Post created successfully',
        status_code=201
    )


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
        return create_error_response('POST_NOT_FOUND', 'Post not found', status_code=404)

    # Only increment view count for published posts
    if post.status == 'published':
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

    return create_success_response(data=post_data)


@token_required
@resource_owner_required(Post, 'post_id', 'author_id')
def update_post(current_user, post_id, resource=None):
    """
    Update an existing post.
    
    Request Body:
    {
        "title": "Updated: Best Practices for Organic Corn Farming",
        "content": "Updated content here...",
        ...other fields to update...
    }
    """
    post = resource  # Provided by resource_owner_required decorator
    
    # Handle both JSON and form data
    if request.is_json:
        data = request.get_json()
        featured_image = None
    else:
        data = request.form.to_dict()
        featured_image = request.files.get('featured_image')
    
    if not data:
        return create_error_response('INVALID_REQUEST', 'Request body is required')
    
    # Parse JSON arrays from form data
    if not request.is_json:
        try:
            if 'related_crops' in data:
                data['related_crops'] = json.loads(data.get('related_crops', '[]'))
            if 'applicable_locations' in data:
                data['applicable_locations'] = json.loads(data.get('applicable_locations', '[]'))
            if 'tags' in data:
                data['tags'] = json.loads(data.get('tags', '[]'))
        except json.JSONDecodeError:
            return create_error_response('INVALID_JSON', 'Invalid JSON in array fields')
    
    # Validate article data if provided
    if any(field in data for field in ['title', 'content', 'season_relevance', 'status']):
        validation_result = validate_agricultural_data(data, 'article')
        if not validation_result.success:
            return validation_result.to_response()
    
    # Handle featured image update
    if featured_image:
        filename = secure_filename(featured_image.filename)
        if filename != '':
            allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
            if '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions:
                unique_filename = str(uuid.uuid4()) + '_' + filename
                post.featured_image_url = f"uploads/images/{unique_filename}"
            else:
                return create_error_response('INVALID_FILE_TYPE', 'Invalid file type. Allowed types are png, jpg, jpeg, gif, webp.')
    
    # Sanitize and update content
    if 'content' in data:
        post.content = sanitize_html_content(data['content'])
        # Recalculate read time if content changes
        word_count = len(bleach.clean(data['content'], tags=[], strip=True).split())
        post.read_time = max(1, math.ceil(word_count / 200))
    
    # Validate and update category
    if 'category_id' in data:
        category = Category.query.get(data.get('category_id'))
        if not category:
            return create_error_response('INVALID_REFERENCE', f"Category with id {data.get('category_id')} not found")
        post.category_id = category.category_id
    
    # Update basic fields
    for field in ['title', 'excerpt', 'season_relevance', 'status']:
        if field in data:
            setattr(post, field, data[field])
    
    # Update array fields
    if 'related_crops' in data:
        post.related_crops = data.get('related_crops', [])
    if 'applicable_locations' in data:
        post.applicable_locations = data.get('applicable_locations', [])
    
    # Update published_at if status changed to published
    if 'status' in data and data['status'] == 'published' and not post.published_at:
        post.published_at = datetime.utcnow()
    
    # Update tags if provided
    if 'tags' in data:
        tags_list = data.get('tags', [])
        # Clear existing tags
        post.tags = []
        
        # Add new tags
        for tag_name in tags_list:
            if tag_name.strip():  # Skip empty tags
                # Check if tag exists
                tag = Tag.query.filter_by(name=tag_name.strip()).first()
                if not tag:
                    # Create new tag
                    tag = Tag(name=tag_name.strip())
                    db.session.add(tag)
                    db.session.flush()
                
                # Add tag to post if not already added
                if tag not in post.tags:
                    post.tags.append(tag)
    
    post.updated_at = datetime.utcnow()
    db.session.commit()
    
    return create_success_response(
        data={'post': post.to_dict()},
        message='Post updated successfully'
    )


@token_required
@resource_owner_required(Post, 'post_id', 'author_id')
def delete_post(current_user, post_id, resource=None):
    """
    Delete (archive) a post.
    """
    post = resource  # Provided by resource_owner_required decorator
    
    # Soft delete (archive) the post
    post.status = 'archived'
    post.updated_at = datetime.utcnow()
    db.session.commit()
    
    return create_success_response(message='Post archived successfully')


def add_comment(post_id, current_user=None):
    """
    Handle both GET and POST requests for comments.
    GET: Retrieve comments for a post
    POST: Add a new comment to a post
    """
    post = Post.query.get(post_id)
    
    if not post:
        return create_error_response('POST_NOT_FOUND', 'Post not found', status_code=404)
    
    if request.method == 'GET':
        # Get comments for the post
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

        return create_success_response(data=top_level_comments)
    
    elif request.method == 'POST':
        # Add a new comment (requires authentication)
        if not current_user:
            return create_error_response('AUTHENTICATION_REQUIRED', 'Authentication required', status_code=401)
            
        data = request.get_json()
        
        if not data or not data.get('content'):
            return create_error_response('MISSING_CONTENT', 'Comment content is required')
        
        # Validate comment content length
        content = data.get('content', '').strip()
        if len(content) < 1:
            return create_error_response('INVALID_CONTENT', 'Comment content cannot be empty')
        if len(content) > 1000:
            return create_error_response('CONTENT_TOO_LONG', 'Comment content cannot exceed 1000 characters')
        
        # Sanitize comment content
        sanitized_content = sanitize_html_content(content)
        
        # Validate parent comment if provided
        parent_comment_id = data.get('parent_comment_id')
        if parent_comment_id:
            parent_comment = Comment.query.filter_by(
                comment_id=parent_comment_id, 
                post_id=post_id
            ).first()
            if not parent_comment:
                return create_error_response('INVALID_PARENT', 'Parent comment not found')
        
        # Create comment
        comment = Comment(
            post_id=post_id,
            user_id=current_user.user_id,
            content=sanitized_content,
            parent_comment_id=parent_comment_id
        )
        
        db.session.add(comment)
        db.session.commit()
        
        # Send notification to post author (if not commenting on own post)
        if str(post.author_id) != str(current_user.user_id):
            try:
                from server.models.notifications import Notification
                from server.services.notification_service import notification_service
                
                notification = Notification(
                    user_id=post.author_id,
                    type='new_comment',
                    title='New Comment',
                    message=f'{current_user.first_name} {current_user.last_name} commented on your post: {post.title}',
                    data={
                        'comment_id': str(comment.comment_id),
                        'post_id': str(post.post_id),
                        'post_title': post.title,
                        'commenter_id': str(current_user.user_id),
                        'commenter_name': f'{current_user.first_name} {current_user.last_name}',
                        'comment_content': content[:100] + '...' if len(content) > 100 else content
                    },
                    channels=['push', 'in_app']
                )
                
                db.session.add(notification)
                db.session.commit()
                
                # Send notification asynchronously
                import asyncio
                asyncio.run(notification_service.send_notification(notification))
                
            except Exception as e:
                current_app.logger.error(f"Error sending comment notification: {str(e)}")
                # Don't fail the comment creation if notification fails
        
        return create_success_response(
            data={'comment': comment.to_dict()},
            message='Comment added successfully',
            status_code=201
        )


@token_required
@rate_limit_moderate
def toggle_like(current_user, post_id):
    """
    Toggle like on a post.
    """
    post = Post.query.get(post_id)
    
    if not post:
        return create_error_response('POST_NOT_FOUND', 'Post not found', status_code=404)
    
    if post.status != 'published':
        return create_error_response('POST_NOT_AVAILABLE', 'Cannot like unpublished posts', status_code=403)
    
    # Check if user already liked the post
    like = PostLike.query.filter_by(post_id=post_id, user_id=current_user.user_id).first()
    
    if like:
        # Unlike
        db.session.delete(like)
        db.session.commit()
        return create_success_response(
            data={'liked': False},
            message='Post unliked successfully'
        )
    else:
        # Like
        like = PostLike(post_id=post_id, user_id=current_user.user_id)
        db.session.add(like)
        db.session.commit()
        return create_success_response(
            data={'liked': True},
            message='Post liked successfully',
            status_code=201
        )