"""
Payment integration service for handling payment events and notifications.
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from server.database import db
from server.models.payment import Payment
from server.models.user import User
from server.models.notifications import Notification
from server.services.notification_service import notification_service
from server.services.mpesa_service import MpesaService


class PaymentIntegrationService:
    """Service for integrating payment events with notifications and consultations."""
    
    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.mpesa_service = MpesaService()
    
    def initiate_consultation_payment(self, user_id: str, expert_id: str, amount: float, 
                                    phone_number: str, consultation_type: str = "general") -> Dict[str, Any]:
        """
        Initiate payment for expert consultation.
        
        Args:
            user_id: ID of the user paying for consultation
            expert_id: ID of the expert being consulted
            amount: Payment amount
            phone_number: User's phone number for M-Pesa
            consultation_type: Type of consultation
            
        Returns:
            Dict with payment initiation result
        """
        try:
            # Validate users
            user = User.query.get(user_id)
            expert = User.query.get(expert_id)
            
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error': 'user_not_found'
                }
            
            if not expert:
                return {
                    'success': False,
                    'message': 'Expert not found',
                    'error': 'expert_not_found'
                }
            
            if expert.role != 'expert':
                return {
                    'success': False,
                    'message': 'Selected user is not an expert',
                    'error': 'not_expert'
                }
            
            # Create payment record
            payment = Payment(
                user_id=user_id,
                amount=amount,
                phone_number=phone_number,
                payment_type='consultation',
                description=f'Consultation with {expert.first_name} {expert.last_name}',
                status='pending'
            )
            
            db.session.add(payment)
            db.session.flush()  # Get payment ID
            
            # Initiate M-Pesa payment
            try:
                mpesa_result = self.mpesa_service.stk_push(
                    phone_number=phone_number,
                    amount=amount,
                    account_reference=str(payment.payment_id),
                    transaction_desc=f'Consultation payment - {consultation_type}'
                )
                
                if mpesa_result['success']:
                    # Update payment with M-Pesa details
                    payment.checkout_request_id = mpesa_result['checkout_request_id']
                    payment.merchant_request_id = mpesa_result['merchant_request_id']
                    
                    db.session.commit()
                    
                    # Send payment initiation notifications
                    self._send_payment_initiated_notifications(payment, user, expert, consultation_type)
                    
                    return {
                        'success': True,
                        'message': 'Payment initiated successfully',
                        'payment_id': str(payment.payment_id),
                        'checkout_request_id': mpesa_result['checkout_request_id'],
                        'customer_message': mpesa_result['customer_message']
                    }
                else:
                    # M-Pesa initiation failed
                    payment.status = 'failed'
                    payment.failure_reason = 'M-Pesa initiation failed'
                    db.session.commit()
                    
                    return {
                        'success': False,
                        'message': 'Failed to initiate M-Pesa payment',
                        'error': 'mpesa_failed'
                    }
                    
            except Exception as e:
                payment.status = 'failed'
                payment.failure_reason = str(e)
                db.session.commit()
                
                self.logger.error(f"M-Pesa error for payment {payment.payment_id}: {str(e)}")
                return {
                    'success': False,
                    'message': f'Payment initiation failed: {str(e)}',
                    'error': 'payment_failed'
                }
                
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in initiate_consultation_payment: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to initiate payment: {str(e)}',
                'error': 'initiation_failed'
            }
    
    def handle_payment_completion(self, payment_id: str) -> Dict[str, Any]:
        """
        Handle successful payment completion.
        
        Args:
            payment_id: ID of the completed payment
            
        Returns:
            Dict with handling result
        """
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {
                    'success': False,
                    'message': 'Payment not found',
                    'error': 'payment_not_found'
                }
            
            if payment.status != 'completed':
                return {
                    'success': False,
                    'message': 'Payment is not completed',
                    'error': 'payment_not_completed'
                }
            
            user = User.query.get(payment.user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error': 'user_not_found'
                }
            
            # Send payment confirmation notifications
            self._send_payment_confirmation_notifications(payment, user)
            
            # If it's a consultation payment, handle consultation booking
            if payment.payment_type == 'consultation':
                self._handle_consultation_booking(payment, user)
            
            self.logger.info(f"Payment {payment_id} completion handled successfully")
            
            return {
                'success': True,
                'message': 'Payment completion handled successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error in handle_payment_completion: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to handle payment completion: {str(e)}',
                'error': 'handling_failed'
            }
    
    def handle_payment_failure(self, payment_id: str, failure_reason: str = None) -> Dict[str, Any]:
        """
        Handle payment failure.
        
        Args:
            payment_id: ID of the failed payment
            failure_reason: Reason for failure
            
        Returns:
            Dict with handling result
        """
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {
                    'success': False,
                    'message': 'Payment not found',
                    'error': 'payment_not_found'
                }
            
            user = User.query.get(payment.user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error': 'user_not_found'
                }
            
            # Send payment failure notifications
            self._send_payment_failure_notifications(payment, user, failure_reason)
            
            self.logger.info(f"Payment {payment_id} failure handled successfully")
            
            return {
                'success': True,
                'message': 'Payment failure handled successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Error in handle_payment_failure: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to handle payment failure: {str(e)}',
                'error': 'handling_failed'
            }
    
    def send_payment_reminder(self, payment_id: str) -> Dict[str, Any]:
        """
        Send payment reminder for pending payments.
        
        Args:
            payment_id: ID of the payment
            
        Returns:
            Dict with reminder result
        """
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {
                    'success': False,
                    'message': 'Payment not found',
                    'error': 'payment_not_found'
                }
            
            if payment.status != 'pending':
                return {
                    'success': False,
                    'message': 'Payment is not pending',
                    'error': 'payment_not_pending'
                }
            
            user = User.query.get(payment.user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error': 'user_not_found'
                }
            
            # Send reminder notification
            notification = Notification(
                user_id=payment.user_id,
                type='payment_reminder',
                title='Payment Reminder',
                message=f'Your payment of KES {payment.amount} is still pending. Please complete the payment to proceed.',
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'payment_type': payment.payment_type,
                    'description': payment.description
                },
                channels=['push', 'sms', 'in_app'],
                priority='high'
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
            return {
                'success': True,
                'message': 'Payment reminder sent successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in send_payment_reminder: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to send payment reminder: {str(e)}',
                'error': 'reminder_failed'
            }
    
    def process_refund(self, payment_id: str, refund_reason: str = None) -> Dict[str, Any]:
        """
        Process payment refund.
        
        Args:
            payment_id: ID of the payment to refund
            refund_reason: Reason for refund
            
        Returns:
            Dict with refund result
        """
        try:
            payment = Payment.query.get(payment_id)
            if not payment:
                return {
                    'success': False,
                    'message': 'Payment not found',
                    'error': 'payment_not_found'
                }
            
            if payment.status != 'completed':
                return {
                    'success': False,
                    'message': 'Only completed payments can be refunded',
                    'error': 'payment_not_completed'
                }
            
            user = User.query.get(payment.user_id)
            if not user:
                return {
                    'success': False,
                    'message': 'User not found',
                    'error': 'user_not_found'
                }
            
            # Update payment status
            payment.status = 'refunded'
            payment.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Send refund notification
            self._send_refund_notification(payment, user, refund_reason)
            
            self.logger.info(f"Payment {payment_id} refunded successfully")
            
            return {
                'success': True,
                'message': 'Payment refunded successfully'
            }
            
        except Exception as e:
            db.session.rollback()
            self.logger.error(f"Error in process_refund: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to process refund: {str(e)}',
                'error': 'refund_failed'
            }
    
    def get_payment_history(self, user_id: str, page: int = 1, per_page: int = 20) -> Dict[str, Any]:
        """
        Get payment history for a user.
        
        Args:
            user_id: ID of the user
            page: Page number
            per_page: Items per page
            
        Returns:
            Dict with payment history
        """
        try:
            payments_query = Payment.query.filter_by(user_id=user_id).order_by(
                Payment.created_at.desc()
            )
            
            paginated = payments_query.paginate(
                page=page, per_page=per_page, error_out=False
            )
            
            payments = [payment.to_dict() for payment in paginated.items]
            
            return {
                'success': True,
                'payments': payments,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': paginated.total,
                    'pages': paginated.pages,
                    'has_next': paginated.has_next,
                    'has_prev': paginated.has_prev
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error in get_payment_history: {str(e)}")
            return {
                'success': False,
                'message': f'Failed to get payment history: {str(e)}',
                'error': 'history_failed'
            }
    
    def _send_payment_initiated_notifications(self, payment: Payment, user: User, expert: User, consultation_type: str):
        """Send notifications when payment is initiated."""
        try:
            # Notify user
            user_notification = Notification(
                user_id=payment.user_id,
                type='payment_initiated',
                title='Payment Initiated',
                message=f'Your payment of KES {payment.amount} for consultation with {expert.first_name} {expert.last_name} has been initiated. Please complete the payment on your phone.',
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'expert_id': str(expert.user_id),
                    'expert_name': f'{expert.first_name} {expert.last_name}',
                    'consultation_type': consultation_type
                },
                channels=['push', 'in_app']
            )
            
            # Notify expert
            expert_notification = Notification(
                user_id=expert.user_id,
                type='consultation_payment_pending',
                title='Consultation Payment Pending',
                message=f'{user.first_name} {user.last_name} is paying for a consultation with you. Payment is pending confirmation.',
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'user_id': str(user.user_id),
                    'user_name': f'{user.first_name} {user.last_name}',
                    'consultation_type': consultation_type
                },
                channels=['push', 'in_app']
            )
            
            db.session.add(user_notification)
            db.session.add(expert_notification)
            db.session.commit()
            
            # Send notifications asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(user_notification))
            asyncio.run(notification_service.send_notification(expert_notification))
            
        except Exception as e:
            self.logger.error(f"Error sending payment initiated notifications: {str(e)}")
    
    def _send_payment_confirmation_notifications(self, payment: Payment, user: User):
        """Send notifications when payment is confirmed."""
        try:
            notification = Notification(
                user_id=payment.user_id,
                type='payment_confirmation',
                title='Payment Confirmed',
                message=f'Your payment of KES {payment.amount} has been confirmed. Receipt number: {payment.mpesa_receipt_number}',
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'mpesa_receipt_number': payment.mpesa_receipt_number,
                    'payment_type': payment.payment_type,
                    'description': payment.description
                },
                channels=['push', 'email', 'sms', 'in_app'],
                priority='high'
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending payment confirmation notification: {str(e)}")
    
    def _send_payment_failure_notifications(self, payment: Payment, user: User, failure_reason: str = None):
        """Send notifications when payment fails."""
        try:
            message = f'Your payment of KES {payment.amount} has failed.'
            if failure_reason:
                message += f' Reason: {failure_reason}'
            message += ' Please try again.'
            
            notification = Notification(
                user_id=payment.user_id,
                type='payment_failed',
                title='Payment Failed',
                message=message,
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'failure_reason': failure_reason,
                    'payment_type': payment.payment_type,
                    'description': payment.description
                },
                channels=['push', 'sms', 'in_app'],
                priority='high'
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending payment failure notification: {str(e)}")
    
    def _send_refund_notification(self, payment: Payment, user: User, refund_reason: str = None):
        """Send notification when payment is refunded."""
        try:
            message = f'Your payment of KES {payment.amount} has been refunded.'
            if refund_reason:
                message += f' Reason: {refund_reason}'
            
            notification = Notification(
                user_id=payment.user_id,
                type='payment_refunded',
                title='Payment Refunded',
                message=message,
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'refund_reason': refund_reason,
                    'payment_type': payment.payment_type,
                    'description': payment.description
                },
                channels=['push', 'email', 'sms', 'in_app']
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(notification))
            
        except Exception as e:
            self.logger.error(f"Error sending refund notification: {str(e)}")
    
    def _handle_consultation_booking(self, payment: Payment, user: User):
        """Handle consultation booking after successful payment."""
        try:
            # This would integrate with a consultation booking system
            # For now, we'll just send notifications
            
            # Find the expert (this would be stored in consultation_id or derived from payment data)
            # For now, we'll extract from payment description or add expert_id to payment model
            
            # Send consultation booked notification to user
            user_notification = Notification(
                user_id=payment.user_id,
                type='consultation_booked',
                title='Consultation Booked',
                message=f'Your consultation has been booked successfully. The expert will contact you soon.',
                data={
                    'payment_id': str(payment.payment_id),
                    'amount': float(payment.amount),
                    'consultation_type': 'general'  # This would come from payment data
                },
                channels=['push', 'email', 'in_app']
            )
            
            db.session.add(user_notification)
            db.session.commit()
            
            # Send notification asynchronously
            import asyncio
            asyncio.run(notification_service.send_notification(user_notification))
            
        except Exception as e:
            self.logger.error(f"Error handling consultation booking: {str(e)}")


# Global payment integration service instance
payment_integration_service = PaymentIntegrationService()