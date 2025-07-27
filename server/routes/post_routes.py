from flask import Blueprint
from server.controllers.post_controller import (
    get_posts, create_post, get_post, update_post, 
    delete_post, add_comment, toggle_like
)

post_bp = Blueprint('post', __name__, url_prefix='/api/posts')

# Post routes
post_bp.route('', methods=['GET'])(get_posts)
post_bp.route('', methods=['POST'])(create_post)
post_bp.route('/<string:post_id>', methods=['GET'])(get_post)
post_bp.route('/<string:post_id>', methods=['PUT'])(update_post)
post_bp.route('/<string:post_id>', methods=['DELETE'])(delete_post)
post_bp.route('/<string:post_id>/comments', methods=['GET', 'POST'])(add_comment)
post_bp.route('/<string:post_id>/like', methods=['POST'])(toggle_like)