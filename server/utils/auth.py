from functools import wraps
from flask import request, jsonify, current_app, g
import jwt
from server.models.user import User
from server.database import db
import uuid

def token_required(f):
    """Decorator for endpoints that require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'AUTHENTICATION_REQUIRED',
                    'message': 'Authentication token is required'
                }
            }), 401
        
        try:
            # Decode token
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(user_id=data['user_id']).first()
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'USER_NOT_FOUND',
                        'message': 'User not found'
                    }
                }), 404
                
            if not current_user.is_active:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'ACCOUNT_INACTIVE',
                        'message': 'User account is inactive'
                    }
                }), 403
                
            # Store user in Flask's g object for access in other decorators
            g.current_user = current_user
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TOKEN_EXPIRED',
                    'message': 'Authentication token has expired'
                }
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_TOKEN',
                    'message': 'Invalid authentication token'
                }
            }), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated


def admin_required(f):
    """Decorator for endpoints that require admin privileges."""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INSUFFICIENT_PRIVILEGES',
                    'message': 'Admin privileges required'
                }
            }), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def role_required(roles):
    """Decorator for endpoints that require specific roles."""
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in roles:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INSUFFICIENT_PRIVILEGES',
                        'message': f'Required role: {", ".join(roles)}'
                    }
                }), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


def resource_owner_required(resource_model, resource_id_param='resource_id', owner_field='user_id'):
    """
    Decorator for endpoints that require resource ownership or admin privileges.
    
    Args:
        resource_model: The SQLAlchemy model class
        resource_id_param: The parameter name containing the resource ID
        owner_field: The field name in the model that contains the owner's user_id
    """
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            # Get resource ID from kwargs or request
            resource_id = kwargs.get(resource_id_param)
            if not resource_id:
                # Try to get from request args or form
                resource_id = request.args.get(resource_id_param) or request.form.get(resource_id_param)
                if not resource_id and request.is_json:
                    resource_id = request.get_json().get(resource_id_param)
            
            if not resource_id:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'MISSING_RESOURCE_ID',
                        'message': f'Resource ID ({resource_id_param}) is required'
                    }
                }), 400
            
            # Convert to UUID if needed
            try:
                if hasattr(resource_model, owner_field) and isinstance(getattr(resource_model, owner_field).type, db.UUID):
                    if isinstance(resource_id, str):
                        resource_id = uuid.UUID(resource_id)
            except (ValueError, AttributeError):
                pass
            
            # Get the resource
            resource = resource_model.query.get(resource_id)
            if not resource:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'RESOURCE_NOT_FOUND',
                        'message': 'Resource not found'
                    }
                }), 404
            
            # Check ownership or admin privileges
            resource_owner_id = getattr(resource, owner_field)
            if current_user.role != 'admin' and resource_owner_id != current_user.user_id:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INSUFFICIENT_PRIVILEGES',
                        'message': 'You can only access your own resources'
                    }
                }), 403
            
            # Store resource in kwargs for the decorated function
            kwargs['resource'] = resource
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


def expert_required(f):
    """Decorator for endpoints that require expert role."""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role not in ['expert', 'admin']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INSUFFICIENT_PRIVILEGES',
                    'message': 'Expert privileges required'
                }
            }), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def verified_user_required(f):
    """Decorator for endpoints that require verified users."""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_verified:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VERIFICATION_REQUIRED',
                    'message': 'Account verification required'
                }
            }), 403
        return f(current_user, *args, **kwargs)
    
    return decorated


def get_current_user_optional():
    """
    Get current user from token if available, return None if not authenticated.
    This is useful for endpoints that work with or without authentication.
    """
    token = None
    
    # Get token from header
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
    
    if not token:
        return None
    
    try:
        # Decode token
        data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        current_user = User.query.filter_by(user_id=data['user_id']).first()
        
        if not current_user or not current_user.is_active:
            return None
            
        return current_user
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None