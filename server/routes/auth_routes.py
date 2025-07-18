from flask import Blueprint
from server.controllers.auth_controller import register, login, get_profile, update_profile, change_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Authentication routes
auth_bp.route('/register', methods=['POST'])(register)
auth_bp.route('/login', methods=['POST'])(login)
auth_bp.route('/profile', methods=['GET'])(get_profile)
auth_bp.route('/profile', methods=['PUT'])(update_profile)
auth_bp.route('/change-password', methods=['POST'])(change_password)