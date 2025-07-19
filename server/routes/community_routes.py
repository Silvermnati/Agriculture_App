from flask import Blueprint
from server.controllers.community_controller import (
    get_communities, create_community, get_community, 
    update_community, delete_community, join_community,
    get_community_posts, create_community_post
)

community_bp = Blueprint('community', __name__, url_prefix='/api/communities')

# Community routes
community_bp.route('', methods=['GET'])(get_communities)
community_bp.route('', methods=['POST'])(create_community)
community_bp.route('/<uuid:community_id>', methods=['GET'])(get_community)
community_bp.route('/<uuid:community_id>', methods=['PUT'])(update_community)
community_bp.route('/<uuid:community_id>', methods=['DELETE'])(delete_community)
community_bp.route('/<uuid:community_id>/join', methods=['POST'])(join_community)
community_bp.route('/<uuid:community_id>/posts', methods=['GET'])(get_community_posts)
community_bp.route('/<uuid:community_id>/posts', methods=['POST'])(create_community_post)