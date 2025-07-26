"""
Rate limiting middleware for API protection.
"""
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime, timedelta
import json
import hashlib
from typing import Dict, Optional

class RateLimiter:
    """Rate limiter using Redis for distributed rate limiting."""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client or self._get_redis_client()
    
    def _get_redis_client(self):
        """Get Redis client. Falls back to in-memory storage if Redis unavailable."""
        try:
            import redis
            client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
            client.ping()  # Test connection
            return client
        except:
            # Fallback to in-memory storage for development
            return InMemoryStorage()
    
    def _get_client_id(self) -> str:
        """Get unique client identifier."""
        # Use user ID if authenticated, otherwise use IP address
        if hasattr(g, 'current_user') and g.current_user:
            return f"user:{g.current_user.user_id}"
        else:
            # Use IP address and User-Agent for anonymous users
            ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            user_agent = request.headers.get('User-Agent', '')
            client_hash = hashlib.md5(f"{ip}:{user_agent}".encode()).hexdigest()
            return f"ip:{client_hash}"
    
    def _get_rate_limit_key(self, endpoint: str, client_id: str, window: str) -> str:
        """Generate rate limit key for Redis."""
        return f"rate_limit:{endpoint}:{client_id}:{window}"
    
    def is_rate_limited(self, endpoint: str, limit: int, window_seconds: int) -> tuple[bool, Dict]:
        """
        Check if client is rate limited.
        
        Returns:
            tuple: (is_limited, info_dict)
        """
        client_id = self._get_client_id()
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=window_seconds)
        
        # Create time window key (e.g., "2024-01-01:14:30" for 1-minute windows)
        window_key = now.strftime("%Y-%m-%d:%H:%M")
        rate_limit_key = self._get_rate_limit_key(endpoint, client_id, window_key)
        
        try:
            # Get current count
            current_count = self.redis_client.get(rate_limit_key)
            current_count = int(current_count) if current_count else 0
            
            # Check if limit exceeded
            if current_count >= limit:
                # Get TTL for reset time
                ttl = self.redis_client.ttl(rate_limit_key)
                reset_time = now + timedelta(seconds=ttl) if ttl > 0 else now + timedelta(seconds=window_seconds)
                
                return True, {
                    'limit': limit,
                    'remaining': 0,
                    'reset_time': reset_time.isoformat(),
                    'retry_after': ttl if ttl > 0 else window_seconds
                }
            
            # Increment counter
            pipe = self.redis_client.pipeline()
            pipe.incr(rate_limit_key)
            pipe.expire(rate_limit_key, window_seconds)
            pipe.execute()
            
            return False, {
                'limit': limit,
                'remaining': limit - current_count - 1,
                'reset_time': (now + timedelta(seconds=window_seconds)).isoformat(),
                'retry_after': 0
            }
            
        except Exception as e:
            # If Redis fails, allow the request (fail open)
            print(f"Rate limiter error: {e}")
            return False, {
                'limit': limit,
                'remaining': limit - 1,
                'reset_time': (now + timedelta(seconds=window_seconds)).isoformat(),
                'retry_after': 0
            }

class InMemoryStorage:
    """Fallback in-memory storage for rate limiting when Redis is unavailable."""
    
    def __init__(self):
        self.storage = {}
    
    def get(self, key):
        entry = self.storage.get(key)
        if entry and entry['expires'] > datetime.utcnow():
            return str(entry['value'])
        elif entry:
            del self.storage[key]
        return None
    
    def incr(self, key):
        entry = self.storage.get(key)
        if entry and entry['expires'] > datetime.utcnow():
            entry['value'] += 1
            return entry['value']
        else:
            self.storage[key] = {'value': 1, 'expires': datetime.utcnow() + timedelta(seconds=60)}
            return 1
    
    def expire(self, key, seconds):
        if key in self.storage:
            self.storage[key]['expires'] = datetime.utcnow() + timedelta(seconds=seconds)
    
    def ttl(self, key):
        entry = self.storage.get(key)
        if entry:
            remaining = (entry['expires'] - datetime.utcnow()).total_seconds()
            return max(0, int(remaining))
        return -1
    
    def pipeline(self):
        return InMemoryPipeline(self)

class InMemoryPipeline:
    """Pipeline for in-memory storage."""
    
    def __init__(self, storage):
        self.storage = storage
        self.commands = []
    
    def incr(self, key):
        self.commands.append(('incr', key))
        return self
    
    def expire(self, key, seconds):
        self.commands.append(('expire', key, seconds))
        return self
    
    def execute(self):
        results = []
        for command in self.commands:
            if command[0] == 'incr':
                results.append(self.storage.incr(command[1]))
            elif command[0] == 'expire':
                self.storage.expire(command[1], command[2])
                results.append(True)
        self.commands = []
        return results

# Global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(limit: int, window_seconds: int = 60, per_user: bool = True):
    """
    Rate limiting decorator.
    
    Args:
        limit: Maximum number of requests allowed
        window_seconds: Time window in seconds
        per_user: If True, limit per user; if False, limit per IP
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            endpoint = f"{request.endpoint or f.__name__}"
            
            # Check rate limit
            is_limited, info = rate_limiter.is_rate_limited(endpoint, limit, window_seconds)
            
            if is_limited:
                response = jsonify({
                    'success': False,
                    'error': {
                        'code': 'RATE_LIMIT_EXCEEDED',
                        'message': 'Rate limit exceeded',
                        'details': f'Maximum {limit} requests per {window_seconds} seconds allowed'
                    }
                })
                response.status_code = 429
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
                response.headers['X-RateLimit-Reset'] = info['reset_time']
                response.headers['Retry-After'] = str(info['retry_after'])
                return response
            
            # Add rate limit headers to successful responses
            response = f(*args, **kwargs)
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Limit'] = str(info['limit'])
                response.headers['X-RateLimit-Remaining'] = str(info['remaining'])
                response.headers['X-RateLimit-Reset'] = info['reset_time']
            
            return response
        return decorated
    return decorator

# Predefined rate limit decorators for common use cases
def rate_limit_strict(f):
    """Strict rate limiting: 10 requests per minute."""
    return rate_limit(10, 60)(f)

def rate_limit_moderate(f):
    """Moderate rate limiting: 30 requests per minute."""
    return rate_limit(30, 60)(f)

def rate_limit_lenient(f):
    """Lenient rate limiting: 100 requests per minute."""
    return rate_limit(100, 60)(f)

def rate_limit_auth(f):
    """Rate limiting for authentication endpoints: 5 attempts per 15 minutes."""
    return rate_limit(5, 900)(f)

def rate_limit_upload(f):
    """Rate limiting for file uploads: 5 uploads per 10 minutes."""
    return rate_limit(5, 600)(f)