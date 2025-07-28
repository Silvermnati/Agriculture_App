"""
Comment management routes for edit/delete functionality.
"""

from flask import Blueprint, request, jsonify

from server.services.comment_service import comment_service
from server.utils.auth import token_required
from server.utils.validators import validate_uuid
from server.utils.error_handlers import create_error_response, create_success_response


comment_bp = Blueprint('comments', __name__, url_prefix='/api/comments')


@comment_bp.route('/<comment_id>', methods=['PUT'])
@token_required
def edit_comment(current_user, comment_id):
    """Edit a comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return jsonify({
                'success': False,
                'message': 'Invalid comment ID format',
                'error': 'invalid_comment_id'
            }), 400
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required',
                'error': 'missing_body'
            }), 400
        
        content = data.get('content')
        if not content or not content.strip():
            return jsonify({
                'success': False,
                'message': 'Comment content is required',
                'error': 'missing_content'
            }), 400
        
        edit_reason = data.get('edit_reason')
        
        # Edit comment
        result = comment_service.edit_comment(
            comment_id=comment_id,
            user_id=current_user_id,
            new_content=content.strip(),
            edit_reason=edit_reason
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            status_code = 400
            if result.get('error') == 'comment_not_found':
                status_code = 404
            elif result.get('error') == 'permission_denied':
                status_code = 403
            elif result.get('error') == 'comment_deleted':
                status_code = 410  # Gone
            elif result.get('error') == 'edit_time_expired':
                status_code = 422  # Unprocessable Entity
            
            return jsonify(result), status_code
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>', methods=['DELETE'])
@token_required
def delete_comment(current_user, comment_id):
    """Delete a comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Get query parameters
        hard_delete = request.args.get('hard', 'false').lower() == 'true'
        
        # Delete comment
        result = comment_service.delete_comment(
            comment_id=comment_id,
            user_id=current_user_id,
            hard_delete=hard_delete
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            status_code = 400
            if result.get('error') == 'comment_not_found':
                status_code = 404
            elif result.get('error') == 'permission_denied':
                status_code = 403
            elif result.get('error') == 'already_deleted':
                status_code = 410  # Gone
            
            return create_error_response('DELETE_FAILED', result.get('message', 'Failed to delete comment'), status_code=status_code)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>/restore', methods=['POST'])
@token_required
def restore_comment(current_user, comment_id):
    """Restore a soft-deleted comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Restore comment
        result = comment_service.restore_comment(
            comment_id=comment_id,
            user_id=current_user_id
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            status_code = 400
            if result.get('error') == 'comment_not_found':
                status_code = 404
            elif result.get('error') == 'permission_denied':
                status_code = 403
            elif result.get('error') == 'not_deleted':
                status_code = 422  # Unprocessable Entity
            
            return create_error_response('RESTORE_FAILED', result.get('message', 'Failed to restore comment'), status_code=status_code)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>/edit-history', methods=['GET'])
@token_required
def get_edit_history(current_user, comment_id):
    """Get edit history for a comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Get edit history
        result = comment_service.get_edit_history(
            comment_id=comment_id,
            user_id=current_user_id
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            status_code = 400
            if result.get('error') == 'comment_not_found':
                status_code = 404
            elif result.get('error') == 'permission_denied':
                status_code = 403
            
            return create_error_response('GET_HISTORY_FAILED', result.get('message', 'Failed to get edit history'), status_code=status_code)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>/permissions', methods=['GET'])
@token_required
def get_comment_permissions(current_user, comment_id):
    """Get comment with user permissions."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Get comment with permissions
        result = comment_service.get_comment_with_permissions(
            comment_id=comment_id,
            user_id=current_user_id
        )
        
        if result['success']:
            return create_success_response(data=result)
        else:
            status_code = 400
            if result.get('error') == 'comment_not_found':
                status_code = 404
            
            return create_error_response('GET_PERMISSIONS_FAILED', result.get('message', 'Failed to get comment permissions'), status_code=status_code)
            
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>/can-edit', methods=['GET'])
@token_required
def can_edit_comment(current_user, comment_id):
    """Check if current user can edit a comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Check edit permission
        can_edit = comment_service.can_edit_comment(
            comment_id=comment_id,
            user_id=current_user_id
        )
        
        return create_success_response(data={'can_edit': can_edit})
        
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)


@comment_bp.route('/<comment_id>/can-delete', methods=['GET'])
@token_required
def can_delete_comment(current_user, comment_id):
    """Check if current user can delete a comment."""
    try:
        current_user_id = str(current_user.user_id)
        
        # Validate comment ID
        if not validate_uuid(comment_id):
            return create_error_response('INVALID_COMMENT_ID', 'Invalid comment ID format', status_code=400)
        
        # Check delete permission
        can_delete = comment_service.can_delete_comment(
            comment_id=comment_id,
            user_id=current_user_id
        )
        
        return create_success_response(data={'can_delete': can_delete})
        
    except Exception as e:
        return create_error_response('INTERNAL_ERROR', f'Internal server error: {str(e)}', status_code=500)