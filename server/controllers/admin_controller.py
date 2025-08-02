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
        
        # Import all related models
        from server.models.post import Post, Comment, PostLike, PostEditHistory
        from server.models.community import Community, CommunityMember, CommunityPost, CommunityPostLike, CommunityComment
        from server.models.expert import ExpertProfile, Consultation, ExpertReview
        from server.models.article import Article
        from server.models.crop import UserCrop
        from server.models.payment import Payment
        from server.models.notifications import Notification, NotificationPreference
        from server.models.user import UserExpertise, UserFollow
        
        user_uuid = user.user_id
        
        # Delete in order to avoid foreign key constraint violations
        
        # 1. Delete user's notifications and preferences
        Notification.query.filter_by(user_id=user_uuid).delete()
        NotificationPreference.query.filter_by(user_id=user_uuid).delete()
        
        # 2. Delete user's payments
        Payment.query.filter_by(user_id=user_uuid).delete()
        
        # 3. Delete user's crops
        UserCrop.query.filter_by(user_id=user_uuid).delete()
        
        # 4. Delete user's expertise
        UserExpertise.query.filter_by(user_id=user_uuid).delete()
        
        # 5. Delete follow relationships (both as follower and following)
        UserFollow.query.filter_by(follower_id=user_uuid).delete()
        UserFollow.query.filter_by(following_id=user_uuid).delete()
        
        # 6. Delete expert-related data if user is an expert
        if user.role == 'expert':
            # Delete expert reviews (both given and received)
            ExpertReview.query.filter_by(expert_id=user_uuid).delete()
            ExpertReview.query.filter_by(reviewer_id=user_uuid).delete()
            
            # Delete consultations (both as expert and farmer)
            Consultation.query.filter_by(expert_id=user_uuid).delete()
            Consultation.query.filter_by(farmer_id=user_uuid).delete()
            
            # Delete expert profile
            ExpertProfile.query.filter_by(user_id=user_uuid).delete()
        
        # 7. Delete user's articles
        Article.query.filter_by(author_id=user_uuid).delete()
        
        # 8. Delete community-related data
        # Delete community post likes
        CommunityPostLike.query.filter_by(user_id=user_uuid).delete()
        
        # Delete community comments
        CommunityComment.query.filter_by(user_id=user_uuid).delete()
        
        # Delete community posts
        CommunityPost.query.filter_by(user_id=user_uuid).delete()
        
        # Delete community memberships
        CommunityMember.query.filter_by(user_id=user_uuid).delete()
        
        # Delete communities created by user (this will cascade to related data)
        communities_to_delete = Community.query.filter_by(created_by=user_uuid).all()
        for community in communities_to_delete:
            # Delete all community members
            CommunityMember.query.filter_by(community_id=community.community_id).delete()
            # Delete all community posts and their likes/comments
            community_posts = CommunityPost.query.filter_by(community_id=community.community_id).all()
            for post in community_posts:
                CommunityPostLike.query.filter_by(post_id=post.post_id).delete()
                CommunityComment.query.filter_by(post_id=post.post_id).delete()
            CommunityPost.query.filter_by(community_id=community.community_id).delete()
            # Delete the community
            db.session.delete(community)
        
        # 9. Delete post-related data
        # Get all posts by the user
        user_posts = Post.query.filter_by(author_id=user_uuid).all()
        for post in user_posts:
            # Delete post likes
            PostLike.query.filter_by(post_id=post.id).delete()
            # Delete post edit history
            PostEditHistory.query.filter_by(post_id=post.id).delete()
            # Delete comments on the post
            Comment.query.filter_by(post_id=post.id).delete()
            # Delete the post
            db.session.delete(post)
        
        # 10. Delete comments made by the user on other posts
        Comment.query.filter_by(user_id=user_uuid).delete()
        
        # 11. Delete post likes by the user
        PostLike.query.filter_by(user_id=user_uuid).delete()
        
        # 12. Delete post edit history by the user
        PostEditHistory.query.filter_by(edited_by=user_uuid).delete()
        
        # 13. Finally, delete the user
        db.session.delete(user)
        
        # Commit all deletions
        db.session.commit()
        
        current_app.logger.info(f"User {user_id} and all related data permanently deleted by admin {current_user.user_id}")
        
        return create_success_response(message='User and all related data permanently deleted successfully')
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error permanently deleting user {user_id}: {str(e)}")
        return create_error_response('SERVER_ERROR', 'Failed to delete user', status_code=500)


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
        return jsonify({
            'success': True,
            'data': {
                'activity': [
                    {
                        'id': 'test_1',
                        'type': 'test',
                        'description': 'Test activity',
                        'user': 'Test User',
                        'timestamp': '2025-02-08T10:00:00Z',
                        'details': {'test': True}
                    }
                ]
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting recent activity: {str(e)}")
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': 'Failed to fetch recent activity'
            }
        }), 500