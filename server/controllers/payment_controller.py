from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from decimal import Decimal
import uuid
import traceback

from server.database import db
from server.models.payment import Payment, TransactionLog
from server.models.user import User
from server.services.mpesa_service import MpesaService, MpesaError
from server.services.payment_integration_service import payment_integration_service
from server.utils.validators import validate_phone_number, validate_amount


class PaymentController:
    """Controller for handling payment operations."""
    
    def __init__(self):
        self.mpesa_service = None
        self.use_mock_service = False
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialization of M-Pesa service."""
        if self._initialized:
            return
            
        try:
            self.mpesa_service = MpesaService()
            self.use_mock_service = False
        except MpesaError as e:
            current_app.logger.error(f"M-Pesa service initialization failed: {e.message}")
            self.mpesa_service = None
            # Enable mock service when credentials are missing
            self.use_mock_service = True
        except Exception as e:
            current_app.logger.error(f"Unexpected error during M-Pesa initialization: {str(e)}")
            self.mpesa_service = None
            self.use_mock_service = True
            
        self._initialized = True
    
    @jwt_required()
    def initiate_payment(self):
        """Initiate M-Pesa payment."""
        try:
            # Ensure M-Pesa service is initialized
            self._ensure_initialized()
            
            data = request.get_json()
            current_user_id = get_jwt_identity()
            
            # Validate required fields
            required_fields = ['amount', 'phone_number', 'payment_type']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            amount = data['amount']
            phone_number = data['phone_number']
            payment_type = data['payment_type']
            consultation_id = data.get('consultation_id')
            description = data.get('description', f'{payment_type} payment')
            
            # Validate amount
            try:
                amount = float(amount)
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'error': 'Invalid amount'
                }), 400
            
            # Validate phone number
            if not validate_phone_number(phone_number):
                return jsonify({
                    'success': False,
                    'error': 'Invalid phone number format'
                }), 400
            
            # Validate user exists
            user = User.query.get(current_user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'User not found'
                }), 404
            
            # Create payment record
            payment = Payment(
                user_id=current_user_id,
                consultation_id=consultation_id,
                amount=Decimal(str(amount)),
                phone_number=phone_number,
                payment_type=payment_type,
                description=description,
                status='pending'
            )
            
            db.session.add(payment)
            db.session.flush()  # Get the payment ID
            
            # Check if M-Pesa service is available
            if not self.mpesa_service:
                # Use mock service for development/testing
                if self.use_mock_service:
                    current_app.logger.info("Using mock M-Pesa service for payment")
                    # Mock STK push response
                    mock_checkout_request_id = f"ws_CO_DMZ_{uuid.uuid4().hex[:10]}"
                    mock_merchant_request_id = f"29115-34620561-1"
                    
                    payment.checkout_request_id = mock_checkout_request_id
                    payment.merchant_request_id = mock_merchant_request_id
                    
                    db.session.commit()
                    
                    return jsonify({
                        'success': True,
                        'payment_id': str(payment.payment_id),
                        'checkout_request_id': mock_checkout_request_id,
                        'customer_message': 'Mock payment initiated. Check your phone for M-Pesa prompt.',
                        'status': 'pending',
                        'mock': True
                    }), 200
                else:
                    current_app.logger.error("M-Pesa service not available and mock service not enabled")
                    payment.status = 'failed'
                    payment.failure_reason = 'M-Pesa service not configured'
                    db.session.commit()
                    
                    return jsonify({
                        'success': False,
                        'error': 'M-Pesa service is not properly configured. Please contact support.',
                        'code': 'MPESA_NOT_CONFIGURED'
                    }), 503
            
            # Initiate STK push
            try:
                stk_result = self.mpesa_service.stk_push(
                    phone_number=phone_number,
                    amount=amount,
                    account_reference=str(payment.payment_id),
                    transaction_desc=description
                )
                
                if stk_result['success']:
                    # Update payment with M-Pesa details
                    payment.checkout_request_id = stk_result['checkout_request_id']
                    payment.merchant_request_id = stk_result['merchant_request_id']
                    
                    db.session.commit()
                    
                    return jsonify({
                        'success': True,
                        'payment_id': str(payment.payment_id),
                        'checkout_request_id': stk_result['checkout_request_id'],
                        'customer_message': stk_result['customer_message'],
                        'status': 'pending'
                    }), 200
                else:
                    payment.status = 'failed'
                    payment.failure_reason = 'STK push failed'
                    db.session.commit()
                    
                    return jsonify({
                        'success': False,
                        'error': 'Failed to initiate payment'
                    }), 400
                    
            except MpesaError as e:
                payment.status = 'failed'
                payment.failure_reason = e.message
                db.session.commit()
                
                return jsonify({
                    'success': False,
                    'error': e.message,
                    'code': e.code
                }), 400
                
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Payment initiation error: {str(e)}")
            import traceback
            current_app.logger.error(f"Payment initiation traceback: {traceback.format_exc()}")
            return jsonify({
                'success': False,
                'error': f'Internal server error: {str(e)}'
            }), 500
    
    @jwt_required()
    def initiate_consultation_payment(self):
        """Initiate consultation payment with expert."""
        try:
            data = request.get_json()
            current_user_id = get_jwt_identity()
            
            # Validate required fields
            required_fields = ['expert_id', 'amount', 'phone_number']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({
                        'success': False,
                        'error': f'Missing required field: {field}'
                    }), 400
            
            expert_id = data['expert_id']
            amount = data['amount']
            phone_number = data['phone_number']
            consultation_type = data.get('consultation_type', 'general')
            
            # Validate amount
            try:
                amount = float(amount)
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return jsonify({
                    'success': False,
                    'error': 'Invalid amount'
                }), 400
            
            # Validate phone number
            if not validate_phone_number(phone_number):
                return jsonify({
                    'success': False,
                    'error': 'Invalid phone number format'
                }), 400
            
            # Use payment integration service
            result = payment_integration_service.initiate_consultation_payment(
                user_id=current_user_id,
                expert_id=expert_id,
                amount=amount,
                phone_number=phone_number,
                consultation_type=consultation_type
            )
            
            if result['success']:
                return jsonify(result), 200
            else:
                status_code = 400
                if result.get('error') in ['user_not_found', 'expert_not_found']:
                    status_code = 404
                elif result.get('error') == 'not_expert':
                    status_code = 422
                
                return jsonify(result), status_code
                
        except Exception as e:
            current_app.logger.error(f"Consultation payment initiation error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    def handle_callback(self):
        """Handle M-Pesa payment callback."""
        try:
            # Validate callback IP (optional but recommended)
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            if not self.mpesa_service.validate_callback_ip(client_ip):
                current_app.logger.warning(f"Invalid callback IP: {client_ip}")
                # In production, you might want to reject this
                # return jsonify({'success': False, 'error': 'Invalid source'}), 403
            
            callback_data = request.get_json()
            if not callback_data:
                return jsonify({
                    'success': False,
                    'error': 'No callback data received'
                }), 400
            
            # Process the callback
            result = self.mpesa_service.process_callback(callback_data)
            
            if result['success']:
                # Handle payment completion or failure using payment integration service
                payment_id = result.get('payment_id')
                if payment_id:
                    if result.get('status') == 'completed':
                        payment_integration_service.handle_payment_completion(payment_id)
                    elif result.get('status') == 'failed':
                        payment_integration_service.handle_payment_failure(
                            payment_id, 
                            result.get('failure_reason')
                        )
                
                return jsonify({
                    'ResultCode': 0,
                    'ResultDesc': 'Success'
                }), 200
            else:
                return jsonify({
                    'ResultCode': 1,
                    'ResultDesc': result.get('error', 'Processing failed')
                }), 200
                
        except Exception as e:
            current_app.logger.error(f"Callback processing error: {str(e)}")
            return jsonify({
                'ResultCode': 1,
                'ResultDesc': 'Internal server error'
            }), 200  # Always return 200 to M-Pesa
    
    @jwt_required()
    def get_payment_status(self, payment_id):
        """Get payment status."""
        try:
            current_user_id = get_jwt_identity()
            
            # Find payment
            payment = Payment.query.filter_by(
                payment_id=payment_id,
                user_id=current_user_id
            ).first()
            
            if not payment:
                return jsonify({
                    'success': False,
                    'error': 'Payment not found'
                }), 404
            
            # If payment is still pending, query M-Pesa for status
            if payment.status == 'pending' and payment.checkout_request_id:
                # Check if this is a mock payment
                if payment.checkout_request_id.startswith('ws_CO_DMZ_'):
                    # Mock payment - simulate completion after 10 seconds
                    import time
                    time_since_creation = (datetime.utcnow() - payment.created_at).total_seconds()
                    if time_since_creation > 10:  # Auto-complete after 10 seconds
                        payment.status = 'completed'
                        payment.completed_at = datetime.utcnow()
                        payment.mpesa_receipt_number = f"MOCK{uuid.uuid4().hex[:8].upper()}"
                        db.session.commit()
                elif self.mpesa_service:
                    try:
                        status_result = self.mpesa_service.query_transaction_status(
                            payment.checkout_request_id
                        )
                        
                        if status_result['success']:
                            result_code = status_result.get('result_code')
                            if result_code == '0':
                                payment.status = 'completed'
                                payment.completed_at = datetime.utcnow()
                            elif result_code in ['1032', '1037', '9999']:  # Common failure codes
                                payment.status = 'failed'
                                payment.failure_reason = status_result.get('result_desc')
                            
                            db.session.commit()
                            
                    except MpesaError as e:
                        current_app.logger.error(f"Status query error: {e.message}")
            
            return jsonify({
                'success': True,
                'payment': payment.to_dict()
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Get payment status error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @jwt_required()
    def get_payment_history(self):
        """Get user's payment history."""
        try:
            current_user_id = get_jwt_identity()
            page = request.args.get('page', 1, type=int)
            per_page = min(request.args.get('per_page', 10, type=int), 100)
            status = request.args.get('status')
            payment_type = request.args.get('payment_type')
            
            # Build query
            query = Payment.query.filter_by(user_id=current_user_id)
            
            if status:
                query = query.filter_by(status=status)
            if payment_type:
                query = query.filter_by(payment_type=payment_type)
            
            # Order by creation date (newest first)
            query = query.order_by(Payment.created_at.desc())
            
            # Paginate
            payments = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            return jsonify({
                'success': True,
                'payments': [payment.to_dict() for payment in payments.items],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': payments.total,
                    'pages': payments.pages,
                    'has_next': payments.has_next,
                    'has_prev': payments.has_prev
                }
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Get payment history error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @jwt_required()
    def request_refund(self, payment_id):
        """Request payment refund (placeholder for future implementation)."""
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            reason = data.get('reason', 'User requested refund')
            
            # Find payment
            payment = Payment.query.filter_by(
                payment_id=payment_id,
                user_id=current_user_id
            ).first()
            
            if not payment:
                return jsonify({
                    'success': False,
                    'error': 'Payment not found'
                }), 404
            
            if payment.status != 'completed':
                return jsonify({
                    'success': False,
                    'error': 'Only completed payments can be refunded'
                }), 400
            
            # For now, just mark as refund requested
            # In a full implementation, you would integrate with M-Pesa refund API
            payment.status = 'refund_requested'
            payment.failure_reason = reason
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Refund request submitted successfully',
                'payment': payment.to_dict()
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Refund request error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    @jwt_required()
    def get_transaction_logs(self, payment_id):
        """Get transaction logs for a payment (admin only)."""
        try:
            current_user_id = get_jwt_identity()
            
            # Check if user is admin (you might want to implement proper role checking)
            user = User.query.get(current_user_id)
            if not user or user.role != 'admin':
                return jsonify({
                    'success': False,
                    'error': 'Unauthorized'
                }), 403
            
            # Find payment
            payment = Payment.query.get(payment_id)
            if not payment:
                return jsonify({
                    'success': False,
                    'error': 'Payment not found'
                }), 404
            
            # Get transaction logs
            logs = TransactionLog.query.filter_by(payment_id=payment_id).order_by(
                TransactionLog.created_at.desc()
            ).all()
            
            return jsonify({
                'success': True,
                'payment': payment.to_dict(),
                'transaction_logs': [log.to_dict() for log in logs]
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Get transaction logs error: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Internal server error'
            }), 500
    
    def test_mpesa_config(self):
        """Test M-Pesa configuration and connectivity."""
        try:
            # Ensure M-Pesa service is initialized
            self._ensure_initialized()
            
            # Check if M-Pesa service is initialized
            if not self.mpesa_service:
                return jsonify({
                    'success': False,
                    'error': 'M-Pesa service not initialized',
                    'config_status': {
                        'service_initialized': False,
                        'error': 'Missing M-Pesa credentials. Please check environment variables.',
                        'required_env_vars': [
                            'MPESA_CONSUMER_KEY',
                            'MPESA_CONSUMER_SECRET', 
                            'MPESA_PASSKEY'
                        ]
                    }
                }), 503
            
            # Test basic configuration
            config_status = {
                'service_initialized': True,
                'environment': self.mpesa_service.environment,
                'business_short_code': self.mpesa_service.business_short_code,
                'callback_url': self.mpesa_service.callback_url,
                'has_consumer_key': bool(self.mpesa_service.consumer_key),
                'has_consumer_secret': bool(self.mpesa_service.consumer_secret),
                'has_passkey': bool(self.mpesa_service.passkey)
            }
            
            # Test access token generation
            try:
                access_token = self.mpesa_service.get_access_token()
                config_status['access_token_test'] = 'SUCCESS'
                config_status['has_access_token'] = bool(access_token)
            except MpesaError as e:
                config_status['access_token_test'] = 'FAILED'
                config_status['access_token_error'] = e.message
            
            return jsonify({
                'success': True,
                'config_status': config_status
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"M-Pesa config test error: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    def setup_payment_tables(self):
        """Create payment tables if they don't exist."""
        try:
            # Check if tables exist
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            tables_created = []
            
            if 'payments' not in existing_tables:
                current_app.logger.info("Creating payments table...")
                Payment.__table__.create(db.engine)
                tables_created.append('payments')
                current_app.logger.info("Payments table created successfully")
            
            if 'transaction_logs' not in existing_tables:
                current_app.logger.info("Creating transaction_logs table...")
                TransactionLog.__table__.create(db.engine)
                tables_created.append('transaction_logs')
                current_app.logger.info("Transaction logs table created successfully")
            
            return jsonify({
                'success': True,
                'message': 'Payment tables setup complete',
                'tables_created': tables_created,
                'existing_tables': existing_tables
            }), 200
            
        except Exception as e:
            current_app.logger.error(f"Error creating payment tables: {str(e)}")
            current_app.logger.error(f"Traceback: {traceback.format_exc()}")
            return jsonify({
                'success': False,
                'error': f'Failed to create payment tables: {str(e)}'
            }), 500


# Create controller instance
payment_controller = PaymentController()