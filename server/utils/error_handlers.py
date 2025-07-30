"""
Global error handlers for consistent error responses across all endpoints.
"""
from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError, DataError
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
import logging

def register_error_handlers(app):
    """Register global error handlers with the Flask app."""
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'BAD_REQUEST',
                'message': 'Bad request - invalid input data',
                'details': getattr(error, 'description', str(error))
            }
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle 401 Unauthorized errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'UNAUTHORIZED',
                'message': 'Authentication required',
                'details': getattr(error, 'description', 'Please provide valid authentication credentials')
            }
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 Forbidden errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'FORBIDDEN',
                'message': 'Access denied - insufficient privileges',
                'details': getattr(error, 'description', 'You do not have permission to access this resource')
            }
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Resource not found',
                'details': getattr(error, 'description', 'The requested resource could not be found')
            }
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 Method Not Allowed errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'METHOD_NOT_ALLOWED',
                'message': 'Method not allowed',
                'details': f'The {error.description} method is not allowed for this endpoint'
            }
        }), 405
    
    @app.errorhandler(409)
    def conflict(error):
        """Handle 409 Conflict errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'CONFLICT',
                'message': 'Resource conflict',
                'details': getattr(error, 'description', 'The request conflicts with the current state of the resource')
            }
        }), 409
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        """Handle 422 Unprocessable Entity errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'UNPROCESSABLE_ENTITY',
                'message': 'Validation failed',
                'details': getattr(error, 'description', 'The request was well-formed but contains semantic errors')
            }
        }), 422
    
    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        """Handle 429 Too Many Requests errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'RATE_LIMIT_EXCEEDED',
                'message': 'Rate limit exceeded',
                'details': 'Too many requests. Please try again later.'
            }
        }), 429
    
    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server Error."""
        # Log the error for debugging
        current_app.logger.error(f'Internal Server Error: {str(error)}', exc_info=True)
        
        # Return generic error message to client (don't expose internal details)
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'An internal server error occurred',
                'details': 'Please try again later or contact support if the problem persists'
            }
        }), 500
    
    @app.errorhandler(IntegrityError)
    def database_integrity_error(error):
        """Handle database integrity constraint violations."""
        current_app.logger.error(f'Database Integrity Error: {str(error)}')
        
        # Parse common integrity errors
        error_message = str(error.orig) if hasattr(error, 'orig') else str(error)
        
        if 'unique constraint' in error_message.lower():
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DUPLICATE_ENTRY',
                    'message': 'Duplicate entry - resource already exists',
                    'details': 'A resource with these details already exists'
                }
            }), 409
        elif 'foreign key constraint' in error_message.lower():
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_REFERENCE',
                    'message': 'Invalid reference - related resource not found',
                    'details': 'One or more referenced resources do not exist'
                }
            }), 400
        elif 'not null constraint' in error_message.lower():
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_REQUIRED_FIELD',
                    'message': 'Required field missing',
                    'details': 'One or more required fields are missing'
                }
            }), 400
        else:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'Database constraint violation',
                    'details': 'The operation violates database constraints'
                }
            }), 400
    
    @app.errorhandler(DataError)
    def database_data_error(error):
        """Handle database data type errors."""
        current_app.logger.error(f'Database Data Error: {str(error)}')
        
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_DATA_TYPE',
                'message': 'Invalid data type',
                'details': 'One or more fields contain invalid data types'
            }
        }), 400
    
    @app.errorhandler(InvalidTokenError)
    def invalid_token_error(error):
        """Handle JWT invalid token errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_TOKEN',
                'message': 'Invalid authentication token',
                'details': 'Please provide a valid authentication token'
            }
        }), 401
    
    @app.errorhandler(ExpiredSignatureError)
    def expired_token_error(error):
        """Handle JWT expired token errors."""
        return jsonify({
            'success': False,
            'error': {
                'code': 'TOKEN_EXPIRED',
                'message': 'Authentication token has expired',
                'details': 'Please log in again to get a new token'
            }
        }), 401
    
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle any unexpected errors."""
        current_app.logger.error(f'Unexpected Error: {str(error)}', exc_info=True)
        
        # In development, show more details
        if current_app.debug:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'UNEXPECTED_ERROR',
                    'message': 'An unexpected error occurred',
                    'details': str(error),
                    'type': type(error).__name__
                }
            }), 500
        else:
            # In production, hide error details
            return jsonify({
                'success': False,
                'error': {
                    'code': 'UNEXPECTED_ERROR',
                    'message': 'An unexpected error occurred',
                    'details': 'Please try again later or contact support'
                }
            }), 500

def create_error_response(code: str, message: str, details: str = None, status_code: int = 400):
    """Helper function to create consistent error responses."""
    error_response = {
        'success': False,
        'error': {
            'code': code,
            'message': message
        }
    }
    
    if details:
        error_response['error']['details'] = details
    
    return jsonify(error_response), status_code

def create_success_response(data=None, message: str = None, pagination=None, status_code: int = 200):
    """Helper function to create consistent success responses."""
    response = {
        'success': True
    }
    
    if data is not None:
        response['data'] = data
    
    if message:
        response['message'] = message
    
    if pagination:
        response['pagination'] = pagination
    
    return jsonify(response), status_code

def handle_error(error, status_code=500):
    """Generic error handler for use in controllers."""
    if isinstance(error, HTTPException):
        return jsonify({
            'success': False,
            'error': {
                'code': error.name.upper().replace(' ', '_'),
                'message': error.description,
                'details': str(error)
            }
        }), error.code
    
    # Log the error
    current_app.logger.error(f'Error: {str(error)}', exc_info=True)
    
    return jsonify({
        'success': False,
        'error': {
            'code': 'INTERNAL_ERROR',
            'message': 'An internal error occurred',
            'details': str(error) if current_app.debug else 'Please try again later'
        }
    }), status_code