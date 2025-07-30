from flask import Blueprint
from server.controllers.crop_controller import (
    get_crops, create_crop, get_crop, update_crop, delete_crop,
    get_user_crops, create_user_crop, get_user_crop, update_user_crop, delete_user_crop
)

crop_bp = Blueprint('crop', __name__, url_prefix='/api/crops')
user_crop_bp = Blueprint('user_crop', __name__, url_prefix='/api/user-crops')

# Crop routes (admin management)
crop_bp.route('', methods=['GET'])(get_crops)
crop_bp.route('', methods=['POST'])(create_crop)
crop_bp.route('/<int:crop_id>', methods=['GET'])(get_crop)
crop_bp.route('/<int:crop_id>', methods=['PUT'])(update_crop)
crop_bp.route('/<int:crop_id>', methods=['DELETE'])(delete_crop)

# User crop routes (farmer records)
user_crop_bp.route('', methods=['GET'])(get_user_crops)
user_crop_bp.route('', methods=['POST'])(create_user_crop)
user_crop_bp.route('/<uuid:user_crop_id>', methods=['GET'])(get_user_crop)
user_crop_bp.route('/<uuid:user_crop_id>', methods=['PUT'])(update_user_crop)
user_crop_bp.route('/<uuid:user_crop_id>', methods=['DELETE'])(delete_user_crop)