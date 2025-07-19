from flask import Blueprint
from server.controllers.expert_controller import (
    get_experts, get_expert, create_expert_profile, 
    book_consultation, get_consultations, update_consultation_status,
    add_review
)

expert_bp = Blueprint('expert', __name__, url_prefix='/api/experts')
consultation_bp = Blueprint('consultation', __name__, url_prefix='/api/consultations')

# Expert routes
expert_bp.route('', methods=['GET'])(get_experts)
expert_bp.route('/profile', methods=['POST'])(create_expert_profile)
expert_bp.route('/<uuid:expert_id>', methods=['GET'])(get_expert)
expert_bp.route('/<uuid:expert_id>/reviews', methods=['POST'])(add_review)

# Consultation routes
consultation_bp.route('', methods=['GET'])(get_consultations)
consultation_bp.route('', methods=['POST'])(book_consultation)
consultation_bp.route('/<uuid:consultation_id>/status', methods=['PUT'])(update_consultation_status)