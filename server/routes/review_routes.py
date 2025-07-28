from flask import Blueprint
from server.controllers.review_controller import (
    get_reviews, create_review, get_review, update_review, delete_review, get_expert_reviews
)

review_bp = Blueprint('review', __name__, url_prefix='/api/reviews')

# Review routes
review_bp.route('', methods=['GET'])(get_reviews)
review_bp.route('', methods=['POST'])(create_review)
review_bp.route('/<uuid:review_id>', methods=['GET'])(get_review)
review_bp.route('/<uuid:review_id>', methods=['PUT'])(update_review)
review_bp.route('/<uuid:review_id>', methods=['DELETE'])(delete_review)

# Expert-specific review routes
review_bp.route('/expert/<uuid:expert_id>', methods=['GET'])(get_expert_reviews)