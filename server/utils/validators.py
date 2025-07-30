"""
Comprehensive data validation utilities for agricultural data types.
"""
import re
from datetime import datetime, date
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Union
import bleach
from flask import jsonify

# Agricultural constants
VALID_SEASONS = ['spring', 'summer', 'fall', 'winter', 'year-round']
VALID_FARMING_TYPES = ['organic', 'conventional', 'mixed', 'hydroponic', 'permaculture']
VALID_SOIL_TYPES = ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'mixed']
VALID_CLIMATE_TYPES = ['tropical', 'subtropical', 'temperate', 'arid', 'semi-arid', 'mediterranean']
VALID_WATER_REQUIREMENTS = ['low', 'moderate', 'high', 'very-high']
VALID_USER_ROLES = ['farmer', 'expert', 'supplier', 'researcher', 'student', 'admin']
VALID_POST_STATUSES = ['draft', 'published', 'archived']
VALID_CONSULTATION_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

# HTML sanitization settings
ALLOWED_HTML_TAGS = [
    'p', 'b', 'i', 'u', 'strong', 'em', 'ol', 'ul', 'li', 'a', 'br', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
]
ALLOWED_HTML_ATTRIBUTES = {
    '*': ['class'],
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height']
}

class ValidationError(Exception):
    """Custom validation error with structured error details."""
    def __init__(self, message: str, field: str = None, code: str = None):
        self.message = message
        self.field = field
        self.code = code or 'VALIDATION_ERROR'
        super().__init__(self.message)

class ValidationResult:
    """Result of validation with success status and error details."""
    def __init__(self, success: bool = True, errors: Dict[str, List[str]] = None):
        self.success = success
        self.errors = errors or {}
    
    def add_error(self, field: str, message: str):
        """Add an error for a specific field."""
        if field not in self.errors:
            self.errors[field] = []
        self.errors[field].append(message)
        self.success = False
    
    def to_response(self, status_code: int = 400):
        """Convert to Flask JSON response."""
        return jsonify({
            'success': self.success,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Invalid input data',
                'details': self.errors
            }
        }), status_code

def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> ValidationResult:
    """Validate that all required fields are present and not empty."""
    result = ValidationResult()
    
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            result.add_error(field, f'{field} is required')
    
    return result

def validate_email(email: str) -> bool:
    """Validate email format."""
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone_number(phone: str) -> bool:
    """Validate phone number format (international format)."""
    if not phone:
        return True  # Phone is optional
    # Allow international format with + and digits, spaces, hyphens
    pattern = r'^\+?[1-9]\d{1,14}$'
    cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone)
    return re.match(pattern, cleaned_phone) is not None

def validate_password_strength(password: str) -> ValidationResult:
    """Validate password strength."""
    result = ValidationResult()
    
    if not password:
        result.add_error('password', 'Password is required')
        return result
    
    if len(password) < 8:
        result.add_error('password', 'Password must be at least 8 characters long')
    
    if not re.search(r'[A-Z]', password):
        result.add_error('password', 'Password must contain at least one uppercase letter')
    
    if not re.search(r'[a-z]', password):
        result.add_error('password', 'Password must contain at least one lowercase letter')
    
    if not re.search(r'\d', password):
        result.add_error('password', 'Password must contain at least one number')
    
    return result

def validate_decimal_field(value: Any, field_name: str, min_value: float = None, max_value: float = None) -> ValidationResult:
    """Validate decimal fields like farm_size, yield_amount."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    try:
        decimal_value = Decimal(str(value))
        if decimal_value < 0:
            result.add_error(field_name, f'{field_name} cannot be negative')
        
        if min_value is not None and decimal_value < Decimal(str(min_value)):
            result.add_error(field_name, f'{field_name} must be at least {min_value}')
        
        if max_value is not None and decimal_value > Decimal(str(max_value)):
            result.add_error(field_name, f'{field_name} cannot exceed {max_value}')
            
    except (InvalidOperation, ValueError, TypeError):
        result.add_error(field_name, f'{field_name} must be a valid number')
    
    return result

def validate_integer_field(value: Any, field_name: str, min_value: int = None, max_value: int = None) -> ValidationResult:
    """Validate integer fields like farming_experience, maturity_days."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    try:
        int_value = int(value)
        if int_value < 0:
            result.add_error(field_name, f'{field_name} cannot be negative')
        
        if min_value is not None and int_value < min_value:
            result.add_error(field_name, f'{field_name} must be at least {min_value}')
        
        if max_value is not None and int_value > max_value:
            result.add_error(field_name, f'{field_name} cannot exceed {max_value}')
            
    except (ValueError, TypeError):
        result.add_error(field_name, f'{field_name} must be a valid integer')
    
    return result

def validate_choice_field(value: Any, field_name: str, valid_choices: List[str]) -> ValidationResult:
    """Validate choice fields against predefined options."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    if value not in valid_choices:
        result.add_error(field_name, f'{field_name} must be one of: {", ".join(valid_choices)}')
    
    return result

def validate_date_field(value: Any, field_name: str, allow_future: bool = True, allow_past: bool = True) -> ValidationResult:
    """Validate date fields."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    try:
        if isinstance(value, str):
            # Try to parse ISO format date
            parsed_date = datetime.fromisoformat(value.replace('Z', '+00:00')).date()
        elif isinstance(value, datetime):
            parsed_date = value.date()
        elif isinstance(value, date):
            parsed_date = value
        else:
            raise ValueError("Invalid date format")
        
        today = date.today()
        
        if not allow_future and parsed_date > today:
            result.add_error(field_name, f'{field_name} cannot be in the future')
        
        if not allow_past and parsed_date < today:
            result.add_error(field_name, f'{field_name} cannot be in the past')
            
    except (ValueError, TypeError):
        result.add_error(field_name, f'{field_name} must be a valid date (YYYY-MM-DD format)')
    
    return result

def validate_string_length(value: Any, field_name: str, min_length: int = None, max_length: int = None) -> ValidationResult:
    """Validate string length constraints."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    if not isinstance(value, str):
        result.add_error(field_name, f'{field_name} must be a string')
        return result
    
    length = len(value.strip())
    
    if min_length is not None and length < min_length:
        result.add_error(field_name, f'{field_name} must be at least {min_length} characters long')
    
    if max_length is not None and length > max_length:
        result.add_error(field_name, f'{field_name} cannot exceed {max_length} characters')
    
    return result

def validate_array_field(value: Any, field_name: str, max_items: int = None, item_validator=None) -> ValidationResult:
    """Validate array fields like related_crops, applicable_locations."""
    result = ValidationResult()
    
    if value is None:
        return result  # Optional field
    
    if not isinstance(value, list):
        result.add_error(field_name, f'{field_name} must be an array')
        return result
    
    if max_items is not None and len(value) > max_items:
        result.add_error(field_name, f'{field_name} cannot have more than {max_items} items')
    
    # Validate individual items if validator provided
    if item_validator:
        for i, item in enumerate(value):
            item_result = item_validator(item, f'{field_name}[{i}]')
            if not item_result.success:
                for error_field, errors in item_result.errors.items():
                    for error in errors:
                        result.add_error(error_field, error)
    
    return result

def sanitize_html_content(content: str) -> str:
    """Sanitize HTML content to prevent XSS attacks."""
    if not content:
        return content
    
    return bleach.clean(
        content,
        tags=ALLOWED_HTML_TAGS,
        attributes=ALLOWED_HTML_ATTRIBUTES,
        strip=True
    )

def validate_agricultural_data(data: Dict[str, Any], data_type: str) -> ValidationResult:
    """Validate agricultural-specific data based on type."""
    result = ValidationResult()
    
    if data_type == 'user_registration':
        # Validate user registration data
        required_result = validate_required_fields(data, ['email', 'password', 'first_name', 'last_name'])
        if not required_result.success:
            result.errors.update(required_result.errors)
        
        if 'email' in data and not validate_email(data['email']):
            result.add_error('email', 'Invalid email format')
        
        if 'password' in data:
            password_result = validate_password_strength(data['password'])
            if not password_result.success:
                result.errors.update(password_result.errors)
        
        if 'role' in data:
            role_result = validate_choice_field(data['role'], 'role', VALID_USER_ROLES)
            if not role_result.success:
                result.errors.update(role_result.errors)
        
        if 'phone_number' in data and not validate_phone_number(data['phone_number']):
            result.add_error('phone_number', 'Invalid phone number format')
        
        # Validate agricultural fields
        farm_size_result = validate_decimal_field(data.get('farm_size'), 'farm_size', 0.01, 100000)
        if not farm_size_result.success:
            result.errors.update(farm_size_result.errors)
        
        experience_result = validate_integer_field(data.get('farming_experience'), 'farming_experience', 0, 100)
        if not experience_result.success:
            result.errors.update(experience_result.errors)
        
        farming_type_result = validate_choice_field(data.get('farming_type'), 'farming_type', VALID_FARMING_TYPES)
        if not farming_type_result.success:
            result.errors.update(farming_type_result.errors)
    
    elif data_type == 'article':
        # Validate article data
        required_result = validate_required_fields(data, ['title', 'content'])
        if not required_result.success:
            result.errors.update(required_result.errors)
        
        title_result = validate_string_length(data.get('title'), 'title', 5, 200)
        if not title_result.success:
            result.errors.update(title_result.errors)
        
        content_result = validate_string_length(data.get('content'), 'content', 50, 50000)
        if not content_result.success:
            result.errors.update(content_result.errors)
        
        season_result = validate_choice_field(data.get('season_relevance'), 'season_relevance', VALID_SEASONS)
        if not season_result.success:
            result.errors.update(season_result.errors)
        
        status_result = validate_choice_field(data.get('status'), 'status', VALID_POST_STATUSES)
        if not status_result.success:
            result.errors.update(status_result.errors)
        
        # Validate arrays
        crops_result = validate_array_field(data.get('related_crops'), 'related_crops', 20)
        if not crops_result.success:
            result.errors.update(crops_result.errors)
        
        locations_result = validate_array_field(data.get('applicable_locations'), 'applicable_locations', 50)
        if not locations_result.success:
            result.errors.update(locations_result.errors)
    
    elif data_type == 'crop':
        # Validate crop data
        required_result = validate_required_fields(data, ['name'])
        if not required_result.success:
            result.errors.update(required_result.errors)
        
        name_result = validate_string_length(data.get('name'), 'name', 2, 100)
        if not name_result.success:
            result.errors.update(name_result.errors)
        
        scientific_name_result = validate_string_length(data.get('scientific_name'), 'scientific_name', 3, 150)
        if not scientific_name_result.success:
            result.errors.update(scientific_name_result.errors)
        
        season_result = validate_choice_field(data.get('growing_season'), 'growing_season', VALID_SEASONS)
        if not season_result.success:
            result.errors.update(season_result.errors)
        
        soil_result = validate_choice_field(data.get('soil_type'), 'soil_type', VALID_SOIL_TYPES)
        if not soil_result.success:
            result.errors.update(soil_result.errors)
        
        water_result = validate_choice_field(data.get('water_requirements'), 'water_requirements', VALID_WATER_REQUIREMENTS)
        if not water_result.success:
            result.errors.update(water_result.errors)
        
        maturity_result = validate_integer_field(data.get('maturity_days'), 'maturity_days', 1, 365)
        if not maturity_result.success:
            result.errors.update(maturity_result.errors)
    
    elif data_type == 'user_crop':
        # Validate user crop record data
        required_result = validate_required_fields(data, ['crop_id'])
        if not required_result.success:
            result.errors.update(required_result.errors)
        
        area_result = validate_decimal_field(data.get('area_planted'), 'area_planted', 0.01, 10000)
        if not area_result.success:
            result.errors.update(area_result.errors)
        
        yield_result = validate_decimal_field(data.get('yield_amount'), 'yield_amount', 0, 100000)
        if not yield_result.success:
            result.errors.update(yield_result.errors)
        
        season_result = validate_choice_field(data.get('season'), 'season', VALID_SEASONS)
        if not season_result.success:
            result.errors.update(season_result.errors)
        
        # Validate dates
        planting_date_result = validate_date_field(data.get('planting_date'), 'planting_date')
        if not planting_date_result.success:
            result.errors.update(planting_date_result.errors)
        
        harvest_date_result = validate_date_field(data.get('expected_harvest'), 'expected_harvest')
        if not harvest_date_result.success:
            result.errors.update(harvest_date_result.errors)
    
    elif data_type == 'review':
        # Validate review data
        required_result = validate_required_fields(data, ['rating', 'comment'])
        if not required_result.success:
            result.errors.update(required_result.errors)
        
        rating_result = validate_integer_field(data.get('rating'), 'rating', 1, 5)
        if not rating_result.success:
            result.errors.update(rating_result.errors)
        
        comment_result = validate_string_length(data.get('comment'), 'comment', 10, 1000)
        if not comment_result.success:
            result.errors.update(comment_result.errors)
    
    return result

def validate_business_rules(data: Dict[str, Any], rule_type: str) -> ValidationResult:
    """Validate business-specific rules."""
    result = ValidationResult()
    
    if rule_type == 'harvest_dates':
        # Ensure harvest date is after planting date
        planting_date = data.get('planting_date')
        harvest_date = data.get('expected_harvest') or data.get('actual_harvest')
        
        if planting_date and harvest_date:
            try:
                if isinstance(planting_date, str):
                    planting_date = datetime.fromisoformat(planting_date.replace('Z', '+00:00')).date()
                if isinstance(harvest_date, str):
                    harvest_date = datetime.fromisoformat(harvest_date.replace('Z', '+00:00')).date()
                
                if harvest_date <= planting_date:
                    result.add_error('expected_harvest', 'Harvest date must be after planting date')
            except (ValueError, TypeError):
                pass  # Date validation will catch format errors
    
    elif rule_type == 'consultation_booking':
        # Validate consultation booking rules
        consultation_date = data.get('consultation_date')
        if consultation_date:
            try:
                if isinstance(consultation_date, str):
                    consultation_date = datetime.fromisoformat(consultation_date.replace('Z', '+00:00'))
                
                if consultation_date <= datetime.now():
                    result.add_error('consultation_date', 'Consultation must be scheduled for a future date')
            except (ValueError, TypeError):
                result.add_error('consultation_date', 'Invalid consultation date format')
    
    return result