from flask import request, jsonify, current_app
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from server.models.user import User
from server.models.post import Post, Comment
from server.models.community import Community, CommunityMember
from server.models.expert import ExpertProfile
from server.database import db
from server.utils.auth import token_required, admin_required
from server.utils.error_handlers import create_error_response, create_success_response

@token_required
@admin_required
def get_all_users(current_user):
    """
    Get all users for admin management.
    
    Query parameters:
    - page: Page number (default: 1)
    - limit: Number of users per page (default: 20, max: 100)
    - search: Search term for name or email
    - role: Filter by role (farmer, expert, admin, etc.)
    - status: Filter by status (active, inactive)
    """
    try:
        page = int(request.args.get('page', 1))
        limit = min(int(request.args.get('limit', 20)), 100)
        search = request.args.get('search', '').strip()
        role_filter = request.args.get('role', '').strip()
        status_filter = request.args.get('status', '').strip()
        
        # Build query
        query = User.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        # Apply role filter
        if role_filter:
            query = query.filter(User.role == role_filter)
        
        # Apply status filter
        if status_filter == 'active':
            query = query.filter(User.is_active == True)
        elif status_filter == 'inactive':
            query = query.filter(User.is_active == False)
        
        # Order by creation date (newest first)
        query = query.order_by(desc(User.created_at))
        
        # Paginate
        pagination = query.paginate(
            page=page, 
            per_page=limit, 
            error_out=False
        )
        
        users = []
        for user in pagination.items:
            user_data = user.to_dict()
            # Add additional stats for admin view
            user_data['posts_count'] = Post.query.filter_by(author_id=user.user_id).count()
            user_data['comments_count'] = Comment.query.filter_by(user_id=user.user_id).count()
            users.append(user_data)
        
        return create_success_response(
            data={
                'users': users,
                'pagination': {
                    'page': page,
                    'pages': pagination.pages,
                    'per_page': limit,
                    'total': pagination.total,
                    'has_next': pagination.has_next,
                    'has_prev': pagination.has_prev
                }
            }
        )
        
    except Exception as e:
        current_app.logger.error(f"Error getting users: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to fetch users', status_code=500)


@token_required
@admin_required
def get_user_by_id(current_user, user_id):
    """Get detailed user information by ID."""
    try:
        user = User.query.get(user_id)
        if not user:
            return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
        
        user_data = user.to_dict()
        
        # Add detailed stats
        user_data['posts_count'] = Post.query.filter_by(author_id=user.user_id).count()
        user_data['comments_count'] = Comment.query.filter_by(user_id=user.user_id).count()
        
        # Add community memberships
        communities = db.session.query(Community).join(CommunityMember).filter(
            CommunityMember.user_id == user.user_id
        ).all()
        user_data['communities'] = [{'id': str(c.community_id), 'name': c.name} for c in communities]
        
        return create_success_response(data=user_data)
        
    except Exception as e:
        current_app.logger.error(f"Error getting user {user_id}: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to fetch user', status_code=500)


@token_required
@admin_required
def update_user_status(current_user, user_id):
    """Toggle user active status."""
    try:
        user = User.query.get(user_id)
        if not user:
            return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
        
        # Don't allow deactivating other admins
        if user.role == 'admin' and user.user_id != current_user.user_id:
            return create_error_response('FORBIDDEN', 'Cannot modify other admin accounts', status_code=403)
        
        user.is_active = not user.is_active
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return create_success_response(
            data={'user': user.to_dict()},
            message=f"User {'activated' if user.is_active else 'deactivated'} successfully"
        )
        
    except Exception as e:
        current_app.logger.error(f"Error updating user status {user_id}: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to update user status', status_code=500)


@token_required
@admin_required
def delete_user(current_user, user_id):
    """Permanently delete a user and all related data (admin only)."""
    try:
        user = User.query.get(user_id)
        if not user:
            return create_error_response('USER_NOT_FOUND', 'User not found', status_code=404)
        
        # Don't allow deleting other admins or self
        if user.role == 'admin':
            return create_error_response('FORBIDDEN', 'Cannot delete admin accounts', status_code=403)
        
        user_uuid = user.user_id
        current_app.logger.info(f"Starting deletion of user {user_id} by admin {current_user.user_id}")
        
        # Import all models at once to avoid import issues
        try:
            from server.models.post import Post, Comment, ArticlePostLike, CommentEdit
        except ImportError:
            from server.models.post import Post, Comment, ArticlePostLike
            CommentEdit = None
            
        from server.models.community import Community, CommunityMember, CommunityPost, PostLike, PostComment
        from server.models.expert import ExpertProfile, Consultation, ExpertReview
        from server.models.article import Article
        from server.models.crop import UserCrop
        from server.models.payment import Payment
        from server.models.notifications import Notification, NotificationPreferences
        from server.models.user import UserExpertise, UserFollow
        
        # Delete in correct order to avoid foreign key constraint violations
        
        # 1. Delete comment edits first (references comments and users)
        if CommentEdit:
            CommentEdit.query.filter_by(edited_by=user_uuid).delete()
        
        # 2. Delete expert reviews (both given and received)
        ExpertReview.query.filter_by(expert_id=user_uuid).delete()
        ExpertReview.query.filter_by(reviewer_id=user_uuid).delete()
        
        # 3. Delete consultations (both as expert and farmer)
        Consultation.query.filter_by(expert_id=user_uuid).delete()
        Consultation.query.filter_by(farmer_id=user_uuid).delete()
        
        # 4. Delete expert profile
        ExpertProfile.query.filter_by(user_id=user_uuid).delete()
        
        # 5. Delete user's payments
        Payment.query.filter_by(user_id=user_uuid).delete()
        
        # 6. Delete user's notifications and preferences
        Notification.query.filter_by(user_id=user_uuid).delete()
        NotificationPreferences.query.filter_by(user_id=user_uuid).delete()
        
        # 7. Delete user's crops
        UserCrop.query.filter_by(user_id=user_uuid).delete()
        
        # 8. Delete user's expertise and follows
        UserExpertise.query.filter_by(user_id=user_uuid).delete()
        UserFollow.query.filter_by(follower_id=user_uuid).delete()
        UserFollow.query.filter_by(following_id=user_uuid).delete()
        
        # 9. Delete community post likes and comments by user
        PostLike.query.filter_by(user_id=user_uuid).delete()
        PostComment.query.filter_by(user_id=user_uuid).delete()
        
        # 10. Delete community posts by user
        CommunityPost.query.filter_by(user_id=user_uuid).delete()
        
        # 11. Delete community memberships
        CommunityMember.query.filter_by(user_id=user_uuid).delete()
        
        # 12. Delete communities created by user (with cascade)
        communities_to_delete = Community.query.filter_by(created_by=user_uuid).all()
        for community in communities_to_delete:
            # Delete all community members
            CommunityMember.query.filter_by(community_id=community.community_id).delete()
            # Delete all community posts and their likes/comments
            community_posts = CommunityPost.query.filter_by(community_id=community.community_id).all()
            for post in community_posts:
                PostLike.query.filter_by(post_id=post.post_id).delete()
                PostComment.query.filter_by(post_id=post.post_id).delete()
            CommunityPost.query.filter_by(community_id=community.community_id).delete()
            # Delete the community
            db.session.delete(community)
        
        # 13. Delete article post likes by the user
        ArticlePostLike.query.filter_by(user_id=user_uuid).delete()
        
        # 14. Delete comments made by the user on posts
        Comment.query.filter_by(user_id=user_uuid).delete()
        
        # 15. Delete posts by the user (with cascade)
        user_posts = Post.query.filter_by(author_id=user_uuid).all()
        for post in user_posts:
            # Delete post likes
            ArticlePostLike.query.filter_by(post_id=post.post_id).delete()
            # Delete comments on the post
            Comment.query.filter_by(post_id=post.post_id).delete()
            # Delete the post
            db.session.delete(post)
        
        # 16. Delete user's articles
        Article.query.filter_by(author_id=user_uuid).delete()
        
        # 17. Finally, delete the user
        db.session.delete(user)
        
        # Commit all deletions
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} and all related data permanently deleted by admin {current_user.user_id}")
        
        return create_success_response(message='User and all related data permanently deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error permanently deleting user {user_id}: {str(e)}")
        import traceback
        current_app.logger.error(f"Full traceback: {traceback.format_exc()}")
        return create_error_response('SERVER_ERROR', f'Failed to delete user: {str(e)}', status_code=500)


@token_required
@admin_required
def get_admin_stats(current_user):
    """Get admin dashboard statistics."""
    try:
        # Get basic counts
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        total_posts = Post.query.count()
        total_communities = Community.query.count()
        total_experts = User.query.filter_by(role='expert').count()
        
        # Get recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users_month = User.query.filter(User.created_at >= thirty_days_ago).count()
        new_posts_month = Post.query.filter(Post.created_at >= thirty_days_ago).count()
        
        # Get user role distribution
        role_stats = db.session.query(
            User.role,
            func.count(User.user_id).label('count')
        ).group_by(User.role).all()
        
        role_distribution = {role: count for role, count in role_stats}
        
        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'total_posts': total_posts,
            'total_communities': total_communities,
            'total_experts': total_experts,
            'new_users_this_month': new_users_month,
            'new_posts_this_month': new_posts_month,
            'role_distribution': role_distribution
        }
        
        return create_success_response(data=stats)
        
    except Exception as e:
        current_app.logger.error(f"Error getting admin stats: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to fetch statistics', status_code=500)


@token_required
@admin_required
def get_recent_activity(current_user):
    """Get recent system activity for admin dashboard."""
    try:
        limit = min(int(request.args.get('limit', 10)), 50)
        
        activity = []
        
        # Get recent users (with error handling)
        try:
            recent_users = User.query.order_by(desc(User.created_at)).limit(5).all()
            for user in recent_users:
                activity.append({
                    'id': f"user_{user.user_id}",
                    'type': 'user_registered',
                    'description': f"{user.first_name or 'Unknown'} {user.last_name or 'User'} registered",
                    'user': f"{user.first_name or 'Unknown'} {user.last_name or 'User'}",
                    'timestamp': user.created_at.isoformat(),
                    'details': {'role': user.role, 'email': user.email}
                })
        except Exception as e:
            current_app.logger.error(f"Error fetching recent users: {str(e)}")
        
        # Get recent posts (with error handling)
        try:
            recent_posts = Post.query.order_by(desc(Post.created_at)).limit(5).all()
            for post in recent_posts:
                author_name = "Unknown"
                if post.author:
                    author_name = f"{post.author.first_name or 'Unknown'} {post.author.last_name or 'User'}"
                
                activity.append({
                    'id': f"post_{post.post_id}",
                    'type': 'post_created',
                    'description': f"New post: {post.title}",
                    'user': author_name,
                    'timestamp': post.created_at.isoformat(),
                    'details': {'title': post.title, 'status': post.status}
                })
        except Exception as e:
            current_app.logger.error(f"Error fetching recent posts: {str(e)}")
        
        # Get recent communities (with error handling)
        try:
            recent_communities = Community.query.order_by(desc(Community.created_at)).limit(5).all()
            for community in recent_communities:
                creator_name = "Unknown"
                if community.creator:
                    creator_name = f"{community.creator.first_name or 'Unknown'} {community.creator.last_name or 'User'}"
                
                activity.append({
                    'id': f"community_{community.community_id}",
                    'type': 'community_created',
                    'description': f"New community: {community.name}",
                    'user': creator_name,
                    'timestamp': community.created_at.isoformat(),
                    'details': {'name': community.name}
                })
        except Exception as e:
            current_app.logger.error(f"Error fetching recent communities: {str(e)}")
        
        # Sort by timestamp (newest first) and limit
        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        activity = activity[:limit]
        
        return create_success_response(data={'activity': activity})
        
    except Exception as e:
        current_app.logger.error(f"Error getting recent activity: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to fetch recent activity', status_code=500)