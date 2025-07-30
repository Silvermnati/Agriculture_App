from flask import Blueprint
from server.controllers.payment_controller import payment_controller

# Create payment blueprint
payment_bp = Blueprint('payments', __name__, url_prefix='/api/payments')

# Payment routes
payment_bp.route('/initiate', methods=['POST'])(payment_controller.initiate_payment)
payment_bp.route('/consultation/initiate', methods=['POST'])(payment_controller.initiate_consultation_payment)
payment_bp.route('/callback', methods=['POST'])(payment_controller.handle_callback)
payment_bp.route('/<payment_id>/status', methods=['GET'])(payment_controller.get_payment_status)
payment_bp.route('/history', methods=['GET'])(payment_controller.get_payment_history)
payment_bp.route('/<payment_id>/refund', methods=['POST'])(payment_controller.request_refund)
payment_bp.route('/<payment_id>/logs', methods=['GET'])(payment_controller.get_transaction_logs)
payment_bp.route('/test-config', methods=['GET'])(payment_controller.test_mpesa_config)