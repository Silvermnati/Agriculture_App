from flask import Blueprint
from server.controllers.admin_controller import (
    get_all_users, get_user_by_id, update_user_status, delete_user,
    get_admin_stats, get_recent_activity
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# User management routes
admin_bp.route('/users', methods=['GET'])(get_all_users)
admin_bp.route('/users/<string:user_id>', methods=['GET'])(get_user_by_id)
admin_bp.route('/users/<string:user_id>/status', methods=['PATCH'])(update_user_status)
admin_bp.route('/users/<string:user_id>', methods=['DELETE'])(delete_user)

# Analytics and stats routes
admin_bp.route('/stats', methods=['GET'])(get_admin_stats)
admin_bp.route('/activity', methods=['GET'])(get_recent_activity)