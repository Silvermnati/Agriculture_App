from flask import Blueprint
from server.controllers.category_controller import (
    get_categories, create_category, get_category, update_category, delete_category,
    get_tags, create_tag, get_tag, update_tag, delete_tag
)

category_bp = Blueprint('category', __name__, url_prefix='/api/categories')
tag_bp = Blueprint('tag', __name__, url_prefix='/api/tags')

# Category routes
category_bp.route('', methods=['GET'])(get_categories)
category_bp.route('', methods=['POST'])(create_category)
category_bp.route('/<int:category_id>', methods=['GET'])(get_category)
category_bp.route('/<int:category_id>', methods=['PUT'])(update_category)
category_bp.route('/<int:category_id>', methods=['DELETE'])(delete_category)

# Tag routes
tag_bp.route('', methods=['GET'])(get_tags)
tag_bp.route('', methods=['POST'])(create_tag)
tag_bp.route('/<int:tag_id>', methods=['GET'])(get_tag)
tag_bp.route('/<int:tag_id>', methods=['PUT'])(update_tag)
tag_bp.route('/<int:tag_id>', methods=['DELETE'])(delete_tag)