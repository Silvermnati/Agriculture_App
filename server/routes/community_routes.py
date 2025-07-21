from flask import Blueprint
from server.controllers.community_controller import (
    get_communities, create_community, get_community, 
    update_community, delete_community, join_community,
    get_community_posts, create_community_post,
    get_community_post, update_community_post, delete_community_post,
    like_community_post, get_post_likes,
    get_post_comments, create_post_comment, update_post_comment, delete_post_comment
)

community_bp = Blueprint('community', __name__, url_prefix='/api/communities')

# Community routes
community_bp.route('', methods=['GET'])(get_communities)
community_bp.route('', methods=['POST'])(create_community)
community_bp.route('/<uuid:community_id>', methods=['GET'])(get_community)
community_bp.route('/<uuid:community_id>', methods=['PUT'])(update_community)
community_bp.route('/<uuid:community_id>', methods=['DELETE'])(delete_community)
community_bp.route('/<uuid:community_id>/join', methods=['POST'])(join_community)

# Community posts routes
community_bp.route('/<uuid:community_id>/posts', methods=['GET'])(get_community_posts)
community_bp.route('/<uuid:community_id>/posts', methods=['POST'])(create_community_post)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>', methods=['GET'])(get_community_post)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>', methods=['PUT'])(update_community_post)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>', methods=['DELETE'])(delete_community_post)

# Post interactions routes
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/like', methods=['POST'])(like_community_post)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/likes', methods=['GET'])(get_post_likes)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/comments', methods=['GET'])(get_post_comments)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/comments', methods=['POST'])(create_post_comment)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>', methods=['PUT'])(update_post_comment)
community_bp.route('/<uuid:community_id>/posts/<uuid:post_id>/comments/<uuid:comment_id>', methods=['DELETE'])(delete_post_comment)