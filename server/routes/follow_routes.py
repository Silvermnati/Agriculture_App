"""
Follow routes for user follow system.
"""

from flask import Blueprint, request, jsonify

from server.services.follow_service import follow_service
from server.utils.auth import token_required
from server.utils.validators import validate_uuid
from server.utils.error_handlers import create_error_response, create_success_response


follow_bp = Blueprint('follow', __name__, url_prefix='/api/follow')


@follow_bp.route('/users/<user_id>/follow', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    """Follow a user."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate user ID
        if not validate_uuid(user_id):
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format',
                'error': 'invalid_user_id'
            }), 400
        
        # Get notification preference from request
        data = request.get_json() or {}
        notification_enabled = data.get('notification_enabled', True)
        
        # Follow user
        result = follow_service.follow_user(
            follower_id=current_user_id,
            following_id=user_id,
            notification_enabled=notification_enabled
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            status_code = 400
            if result.get('error') == 'already_following':
                status_code = 409
            elif result.get('error') in ['follower_not_found', 'following_not_found']:
                status_code = 404
            
            return jsonify(result), status_code
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/follow', methods=['DELETE'])
@token_required
def unfollow_user(current_user, user_id):
    """Unfollow a user."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate user ID
        if not validate_uuid(user_id):
            return jsonify({
                'success': False,
                'message': 'Invalid user ID format',
                'error': 'invalid_user_id'
            }), 400
        
        # Unfollow user
        result = follow_service.unfollow_user(
            follower_id=current_user_id,
            following_id=user_id
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            status_code = 400
            if result.get('error') == 'not_following':
                status_code = 404
            
            return jsonify(result), status_code
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/followers', methods=['GET'])
@token_required
def get_followers(current_user, user_id):
    """Get list of users following the specified user."""
    try:
        # Validate user ID
        if not validate_uuid(user_id):
            return create_error_response('INVALID_USER_ID', 'Invalid user ID format', status_code=400)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        
        # Get followers
        result = follow_service.get_followers(
            user_id=user_id,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_FOLLOWERS_FAILED', result.get('message', 'Failed to get followers'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/following', methods=['GET'])
@token_required
def get_following(current_user, user_id):
    """Get list of users that the specified user is following."""
    try:
        # Validate user ID
        if not validate_uuid(user_id):
            return create_error_response('INVALID_USER_ID', 'Invalid user ID format', status_code=400)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)  # Max 100 per page
        
        # Get following
        result = follow_service.get_following(
            user_id=user_id,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_FOLLOWING_FAILED', result.get('message', 'Failed to get following'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/follow-stats', methods=['GET'])
@token_required
def get_follow_stats(current_user, user_id):
    """Get follow statistics for a user."""
    try:
        # Validate user ID
        if not validate_uuid(user_id):
            return create_error_response('INVALID_USER_ID', 'Invalid user ID format', status_code=400)
        
        # Get follow stats
        result = follow_service.get_follow_stats(user_id)
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_STATS_FAILED', result.get('message', 'Failed to get follow stats'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/is-following', methods=['GET'])
@token_required
def check_is_following(current_user, user_id):
    """Check if current user is following the specified user."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate user ID
        if not validate_uuid(user_id):
            return create_error_response('INVALID_USER_ID', 'Invalid user ID format', status_code=400)
        
        # Check if following
        is_following = follow_service.is_following(
            follower_id=current_user_id,
            following_id=user_id
        )
        
        return create_success_response(data={'is_following': is_following})
        
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/users/<user_id>/notification-preference', methods=['PUT'])
@token_required
def update_notification_preference(current_user, user_id):
    """Update notification preference for a follow relationship."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate user ID
        if not validate_uuid(user_id):
            return create_error_response('INVALID_USER_ID', 'Invalid user ID format', status_code=400)
        
        # Get request data
        data = request.get_json()
        if not data or 'enabled' not in data:
            return create_error_response('MISSING_ENABLED', 'Missing enabled field in request body', status_code=400)
        
        enabled = bool(data['enabled'])
        
        # Update notification preference
        result = follow_service.update_notification_preference(
            follower_id=current_user_id,
            following_id=user_id,
            enabled=enabled
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            status_code = 400
            if result.get('error') == 'follow_not_found':
                status_code = 404
            
            return create_error_response('UPDATE_FAILED', result.get('message', 'Failed to update notification preference'), status_code=status_code)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/my-followers', methods=['GET'])
@token_required
def get_my_followers(current_user):
    """Get current user's followers."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get followers
        result = follow_service.get_followers(
            user_id=current_user_id,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_FOLLOWERS_FAILED', result.get('message', 'Failed to get followers'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/my-following', methods=['GET'])
@token_required
def get_my_following(current_user):
    """Get current user's following list."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get following
        result = follow_service.get_following(
            user_id=current_user_id,
            page=page,
            per_page=per_page
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_FOLLOWING_FAILED', result.get('message', 'Failed to get following'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@follow_bp.route('/my-stats', methods=['GET'])
@token_required
def get_my_follow_stats(current_user):
    """Get current user's follow statistics."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Get follow stats
        result = follow_service.get_follow_stats(current_user_id)
        
        if result['success']:
            return create_success_response(data=result)
        else:
            return create_error_response('GET_STATS_FAILED', result.get('message', 'Failed to get follow stats'), status_code=400)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)