from flask import Blueprint, request
from server.controllers.post_controller import (
    get_posts, create_post, get_post, update_post, 
    delete_post, add_comment, get_comments, toggle_like
)
from server.utils.auth import get_current_user_optional

post_bp = Blueprint('post', __name__, url_prefix='/api/posts')

# Post routes with optional authentication
@post_bp.route('', methods=['GET'])
def get_posts_route():
    """Get posts with optional authentication for follow status."""
    current_user = get_current_user_optional()
    return get_posts(current_user)
post_bp.route('', methods=['POST'])(create_post)
@post_bp.route('/<string:post_id>', methods=['GET'])
def get_post_route(post_id):
    """Get single post with optional authentication for follow status."""
    current_user = get_current_user_optional()
    return get_post(post_id, current_user)
post_bp.route('/<string:post_id>', methods=['PUT'])(update_post)
post_bp.route('/<string:post_id>', methods=['DELETE'])(delete_post)
post_bp.route('/<string:post_id>/comments', methods=['GET'])(get_comments)
post_bp.route('/<string:post_id>/comments', methods=['POST'])(add_comment)
post_bp.route('/<string:post_id>/like', methods=['POST'])(toggle_like)