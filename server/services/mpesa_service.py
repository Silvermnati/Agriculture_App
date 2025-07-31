import base64
import json
import requests
from datetime import datetime
from typing import Dict, Optional
import os
from server.database import db
from server.models.payment import Payment, TransactionLog


class MpesaError(Exception):
    """Custom exception for M-Pesa related errors."""
    def __init__(self, code: str, message: str, details: dict = None):
        self.code = code
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class MpesaService:
    """M-Pesa payment service for handling STK push and callbacks."""
    
    def __init__(self):
        self.consumer_key = os.environ.get('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = os.environ.get('MPESA_CONSUMER_SECRET', '')
        self.business_short_code = os.environ.get('MPESA_BUSINESS_SHORT_CODE', '174379')
        self.passkey = os.environ.get('MPESA_PASSKEY', '')
        self.callback_url = os.environ.get('MPESA_CALLBACK_URL', 'https://agriculture-app-1-u2a6.onrender.com/api/payments/callback')
        self.environment = os.environ.get('MPESA_ENVIRONMENT', 'sandbox')  # sandbox or production
        
        # Validate required credentials
        self._validate_credentials()
        
        # Set base URLs based on environment
        if self.environment == 'production':
            self.base_url = 'https://api.safaricom.co.ke'
        else:
            self.base_url = 'https://sandbox.safaricom.co.ke'
        
        self.access_token = None
        self.token_expires_at = None
    
    def _validate_credentials(self):
        """Validate that required M-Pesa credentials are set."""
        missing_credentials = []
        
        if not self.consumer_key:
            missing_credentials.append('MPESA_CONSUMER_KEY')
        if not self.consumer_secret:
            missing_credentials.append('MPESA_CONSUMER_SECRET')
        if not self.passkey:
            missing_credentials.append('MPESA_PASSKEY')
        
        if missing_credentials:
            raise MpesaError(
                'MISSING_CREDENTIALS',
                f'Missing required M-Pesa credentials: {", ".join(missing_credentials)}. Please check your environment variables.',
                {'missing_credentials': missing_credentials}
            )
    
    def get_access_token(self) -> str:
        """Get M-Pesa access token."""
        try:
            # Check if we have a valid token
            if self.access_token and self.token_expires_at and datetime.now().timestamp() < self.token_expires_at:
                return self.access_token
            
            # Generate new token
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            
            # Create basic auth header
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data['access_token']
                # Token expires in 1 hour, we'll refresh 5 minutes early
                expires_in = int(data.get('expires_in', 3600)) - 300
                self.token_expires_at = datetime.now().timestamp() + expires_in
                return self.access_token
            else:
                raise MpesaError(
                    'TOKEN_ERROR',
                    f'Failed to get access token: {response.text}',
                    {'status_code': response.status_code}
                )
                
        except requests.RequestException as e:
            raise MpesaError('NETWORK_ERROR', f'Network error getting token: {str(e)}')
        except Exception as e:
            raise MpesaError('UNKNOWN_ERROR', f'Unknown error getting token: {str(e)}')
    
    def generate_password(self) -> tuple:
        """Generate password and timestamp for STK push."""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_string = f"{self.business_short_code}{self.passkey}{timestamp}"
        password = base64.b64encode(password_string.encode()).decode()
        return password, timestamp
    
    def stk_push(self, phone_number: str, amount: float, account_reference: str, 
                 transaction_desc: str = "Payment") -> Dict:
        """Initiate STK push payment."""
        try:
            # Validate inputs
            if not phone_number or not amount or not account_reference:
                raise MpesaError('INVALID_INPUT', 'Missing required parameters')
            
            # Format phone number (ensure it starts with 254)
            if phone_number.startswith('0'):
                phone_number = '254' + phone_number[1:]
            elif phone_number.startswith('+254'):
                phone_number = phone_number[1:]
            elif not phone_number.startswith('254'):
                phone_number = '254' + phone_number
            
            # Get access token
            access_token = self.get_access_token()
            password, timestamp = self.generate_password()
            
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_short_code,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': phone_number,
                'PartyB': self.business_short_code,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()
            
            # Log the transaction
            self._log_transaction(
                payment_id=account_reference,
                transaction_type='stk_push',
                request_data=payload,
                response_data=response_data,
                status_code=response.status_code
            )
            
            if response.status_code == 200 and response_data.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'customer_message': response_data.get('CustomerMessage'),
                    'response_code': response_data.get('ResponseCode')
                }
            else:
                error_message = response_data.get('errorMessage') or response_data.get('ResponseDescription', 'Unknown error')
                raise MpesaError(
                    'STK_PUSH_FAILED',
                    error_message,
                    {'response_data': response_data, 'status_code': response.status_code}
                )
                
        except MpesaError:
            raise
        except requests.RequestException as e:
            raise MpesaError('NETWORK_ERROR', f'Network error during STK push: {str(e)}')
        except Exception as e:
            raise MpesaError('UNKNOWN_ERROR', f'Unknown error during STK push: {str(e)}')
    
    def query_transaction_status(self, checkout_request_id: str) -> Dict:
        """Query the status of an STK push transaction."""
        try:
            access_token = self.get_access_token()
            password, timestamp = self.generate_password()
            
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_short_code,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response_data = response.json()
            
            # Log the transaction
            self._log_transaction(
                payment_id=checkout_request_id,
                transaction_type='query',
                request_data=payload,
                response_data=response_data,
                status_code=response.status_code
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'response_code': response_data.get('ResponseCode'),
                    'response_description': response_data.get('ResponseDescription'),
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'result_code': response_data.get('ResultCode'),
                    'result_desc': response_data.get('ResultDesc')
                }
            else:
                raise MpesaError(
                    'QUERY_FAILED',
                    f'Failed to query transaction: {response_data}',
                    {'status_code': response.status_code}
                )
                
        except MpesaError:
            raise
        except requests.RequestException as e:
            raise MpesaError('NETWORK_ERROR', f'Network error during query: {str(e)}')
        except Exception as e:
            raise MpesaError('UNKNOWN_ERROR', f'Unknown error during query: {str(e)}')
    
    def process_callback(self, callback_data: Dict) -> Dict:
        """Process M-Pesa callback data."""
        try:
            # Extract callback information
            stk_callback = callback_data.get('Body', {}).get('stkCallback', {})
            merchant_request_id = stk_callback.get('MerchantRequestID')
            checkout_request_id = stk_callback.get('CheckoutRequestID')
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            
            # Log the callback
            self._log_transaction(
                payment_id=checkout_request_id,
                transaction_type='callback',
                request_data=callback_data,
                response_data={'processed': True},
                status_code=200
            )
            
            # Find the payment record
            payment = Payment.query.filter_by(checkout_request_id=checkout_request_id).first()
            if not payment:
                return {
                    'success': False,
                    'error': 'Payment record not found',
                    'checkout_request_id': checkout_request_id
                }
            
            # Process based on result code
            if result_code == 0:  # Success
                # Extract callback metadata
                callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                metadata = {}
                for item in callback_metadata:
                    name = item.get('Name')
                    value = item.get('Value')
                    if name and value is not None:
                        metadata[name] = value
                
                # Update payment record
                payment.status = 'completed'
                payment.mpesa_receipt_number = metadata.get('MpesaReceiptNumber')
                payment.completed_at = datetime.utcnow()
                
                db.session.commit()
                
                return {
                    'success': True,
                    'status': 'completed',
                    'payment_id': str(payment.payment_id),
                    'mpesa_receipt_number': payment.mpesa_receipt_number,
                    'metadata': metadata
                }
            else:
                # Payment failed
                payment.status = 'failed'
                payment.failure_reason = result_desc
                
                db.session.commit()
                
                return {
                    'success': True,
                    'status': 'failed',
                    'payment_id': str(payment.payment_id),
                    'failure_reason': result_desc
                }
                
        except Exception as e:
            db.session.rollback()
            raise MpesaError('CALLBACK_ERROR', f'Error processing callback: {str(e)}')
    
    def _log_transaction(self, payment_id: str, transaction_type: str, 
                        request_data: Dict, response_data: Dict, status_code: int):
        """Log transaction details."""
        try:
            # Find payment by ID or checkout_request_id
            payment = None
            if payment_id:
                payment = (Payment.query.filter_by(payment_id=payment_id).first() or
                          Payment.query.filter_by(checkout_request_id=payment_id).first())
            
            if payment:
                log = TransactionLog(
                    payment_id=payment.payment_id,
                    transaction_type=transaction_type,
                    request_data=request_data,
                    response_data=response_data,
                    status_code=status_code
                )
                db.session.add(log)
                db.session.commit()
        except Exception as e:
            # Don't fail the main operation if logging fails
            print(f"Failed to log transaction: {str(e)}")
            db.session.rollback()
    
    def validate_callback_ip(self, request_ip: str) -> bool:
        """Validate that callback is coming from Safaricom IPs."""
        # Safaricom callback IPs (update as needed)
        allowed_ips = [
            '196.201.214.200',
            '196.201.214.206',
            '196.201.213.114',
            '196.201.214.207',
            '196.201.214.208',
            '196.201.213.44',
            '196.201.212.127',
            '196.201.212.138',
            '196.201.212.129',
            '196.201.212.136',
            '196.201.212.74'
        ]
        
        # In development/testing, allow localhost
        if self.environment == 'sandbox':
            allowed_ips.extend(['127.0.0.1', 'localhost'])
        
        return request_ip in allowed_ips