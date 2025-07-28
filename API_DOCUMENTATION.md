# Agricultural Super App API Documentation

## Overview

This document provides comprehensive documentation for all CRUD API endpoints in the Agricultural Super App. All endpoints follow RESTful conventions and return JSON responses.

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 5,
    "total_items": 50
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      "field_name": ["Field error message"]
    }
  }
}
```

## Article Management API

### GET /api/articles
Get list of articles with pagination and filtering.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 10, max: 50)
- `category` (int): Filter by category ID
- `tags` (string): Comma-separated tag names
- `crops` (string): Comma-separated crop names
- `season` (string): Filter by season relevance
- `status` (string): Filter by status (published, draft, archived)
- `search` (string): Search in title and content

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "article_id": "uuid",
      "title": "Best Practices for Corn Farming",
      "excerpt": "Learn the essential techniques...",
      "author": {
        "user_id": "uuid",
        "name": "John Farmer",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "category": {
        "category_id": 1,
        "name": "Crop Management"
      },
      "tags": ["corn", "farming", "best-practices"],
      "related_crops": ["corn", "maize"],
      "season_relevance": "spring",
      "featured_image_url": "https://example.com/image.jpg",
      "status": "published",
      "view_count": 150,
      "read_time": 5,
      "published_at": "2024-03-15T10:00:00Z",
      "created_at": "2024-03-10T08:00:00Z",
      "updated_at": "2024-03-12T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 3,
    "total_items": 25
  }
}
```

### POST /api/articles
Create a new article (requires authentication).

**Request Body:**
```json
{
  "title": "Article Title",
  "content": "<p>Article content in HTML</p>",
  "excerpt": "Brief description",
  "category_id": 1,
  "tags": ["tag1", "tag2"],
  "related_crops": ["corn", "wheat"],
  "applicable_locations": ["california", "texas"],
  "season_relevance": "spring",
  "featured_image_url": "https://example.com/image.jpg",
  "status": "published"
}
```

**Response:** Returns created article object with 201 status.

### GET /api/articles/{article_id}
Get a specific article by ID.

**Response:** Returns article object or 404 if not found.

### PUT /api/articles/{article_id}
Update an article (requires authentication and ownership/admin).

**Request Body:** Same as POST, all fields optional.

**Response:** Returns updated article object.

### DELETE /api/articles/{article_id}
Archive an article (requires authentication and ownership/admin).

**Response:** Returns success message.

## Crop Management API

### GET /api/crops
Get list of crops with optional filtering.

**Query Parameters:**
- `category` (string): Filter by crop category
- `season` (string): Filter by growing season
- `climate` (string): Filter by climate requirements
- `search` (string): Search in crop names

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "crop_id": 1,
      "name": "Corn",
      "scientific_name": "Zea mays",
      "category": "grain",
      "growing_season": "spring",
      "climate_requirements": "temperate",
      "water_requirements": "moderate",
      "soil_type": "loamy",
      "maturity_days": 90,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/crops
Create a new crop (admin only).

**Request Body:**
```json
{
  "name": "Crop Name",
  "scientific_name": "Scientific Name",
  "category": "grain",
  "growing_season": "spring",
  "climate_requirements": "temperate",
  "water_requirements": "moderate",
  "soil_type": "loamy",
  "maturity_days": 90
}
```

### GET /api/crops/{crop_id}
Get a specific crop by ID.

### PUT /api/crops/{crop_id}
Update a crop (admin only).

### DELETE /api/crops/{crop_id}
Delete a crop (admin only).

## User Crop Management API

### GET /api/user-crops
Get user's crop records (requires authentication).

**Query Parameters:**
- `season` (string): Filter by season
- `crop_id` (int): Filter by crop ID
- `year` (int): Filter by planting year

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "user_crop_id": "uuid",
      "crop": {
        "crop_id": 1,
        "name": "Corn",
        "category": "grain"
      },
      "area_planted": 10.5,
      "area_unit": "hectares",
      "planting_date": "2024-03-15",
      "expected_harvest": "2024-06-15",
      "actual_harvest": "2024-06-20",
      "yield_amount": 25.0,
      "yield_unit": "tons",
      "notes": "Good harvest this season",
      "season": "spring",
      "created_at": "2024-03-15T08:00:00Z",
      "updated_at": "2024-06-20T16:00:00Z"
    }
  ]
}
```

### POST /api/user-crops
Create a new user crop record (requires authentication).

**Request Body:**
```json
{
  "crop_id": 1,
  "area_planted": 10.5,
  "area_unit": "hectares",
  "planting_date": "2024-03-15",
  "expected_harvest": "2024-06-15",
  "season": "spring",
  "notes": "First time planting this crop"
}
```

### GET /api/user-crops/{user_crop_id}
Get a specific user crop record (requires authentication and ownership).

### PUT /api/user-crops/{user_crop_id}
Update a user crop record (requires authentication and ownership).

### DELETE /api/user-crops/{user_crop_id}
Delete a user crop record (requires authentication and ownership).

## Location Management API

### GET /api/locations/countries
Get list of all countries.

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "country_id": 1,
      "name": "United States",
      "code": "US",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/locations/states/{country_id}
Get states/provinces for a specific country.

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "state_id": 1,
      "name": "California",
      "code": "CA",
      "country_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/locations
Get list of locations with filtering.

**Query Parameters:**
- `country_id` (int): Filter by country
- `state_id` (int): Filter by state
- `city` (string): Filter by city name

### POST /api/locations/countries
Create a new country (admin only).

**Request Body:**
```json
{
  "name": "Country Name",
  "code": "CC"
}
```

### POST /api/locations/states
Create a new state/province (admin only).

**Request Body:**
```json
{
  "name": "State Name",
  "code": "SC",
  "country_id": 1
}
```

### POST /api/locations
Create a new location (admin only).

**Request Body:**
```json
{
  "country_id": 1,
  "state_id": 1,
  "city": "City Name",
  "postal_code": "12345"
}
```

## Category Management API

### GET /api/categories
Get list of all categories.

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "name": "Crop Management",
      "description": "Best practices for growing crops",
      "is_agricultural_specific": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/categories
Create a new category (admin only).

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "is_agricultural_specific": true
}
```

### GET /api/categories/{category_id}
Get a specific category by ID.

### PUT /api/categories/{category_id}
Update a category (admin only).

### DELETE /api/categories/{category_id}
Delete a category (admin only).

## Tag Management API

### GET /api/tags
Get list of tags with optional filtering.

**Query Parameters:**
- `search` (string): Search in tag names
- `limit` (int): Limit number of results

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "tag_id": 1,
      "name": "organic-farming",
      "description": "Related to organic farming practices",
      "usage_count": 25,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/tags
Create a new tag (requires authentication).

**Request Body:**
```json
{
  "name": "tag-name",
  "description": "Tag description"
}
```

### GET /api/tags/{tag_id}
Get a specific tag by ID.

### PUT /api/tags/{tag_id}
Update a tag (admin only).

### DELETE /api/tags/{tag_id}
Delete a tag (admin only).

## Review Management API

### GET /api/reviews
Get list of reviews with filtering.

**Query Parameters:**
- `expert_id` (uuid): Filter by expert
- `rating` (int): Filter by rating (1-5)
- `farmer_id` (uuid): Filter by farmer

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "review_id": "uuid",
      "farmer": {
        "user_id": "uuid",
        "name": "John Farmer"
      },
      "expert": {
        "expert_id": "uuid",
        "name": "Dr. Jane Expert",
        "title": "Agricultural Scientist"
      },
      "consultation_id": "uuid",
      "rating": 5,
      "review_text": "Excellent consultation! Very helpful advice.",
      "would_recommend": true,
      "created_at": "2024-03-15T10:00:00Z",
      "updated_at": "2024-03-15T10:00:00Z"
    }
  ]
}
```

### POST /api/reviews
Create a new review (requires authentication).

**Request Body:**
```json
{
  "expert_id": "uuid",
  "consultation_id": "uuid",
  "rating": 5,
  "review_text": "Great consultation!",
  "would_recommend": true
}
```

### GET /api/reviews/{review_id}
Get a specific review by ID.

### PUT /api/reviews/{review_id}
Update a review (requires authentication and ownership).

### DELETE /api/reviews/{review_id}
Delete a review (requires authentication and ownership/admin).

## Error Codes

### Authentication Errors (401)
- `MISSING_TOKEN`: Authorization token is missing
- `INVALID_TOKEN`: Token is invalid or expired
- `TOKEN_EXPIRED`: Token has expired

### Authorization Errors (403)
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `ADMIN_REQUIRED`: Admin role required for this operation
- `RESOURCE_OWNER_REQUIRED`: Must be resource owner to perform action

### Validation Errors (400)
- `VALIDATION_ERROR`: Input validation failed
- `MISSING_REQUIRED_FIELD`: Required field is missing
- `INVALID_FORMAT`: Field format is invalid
- `INVALID_VALUE`: Field value is not allowed

### Not Found Errors (404)
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `ENDPOINT_NOT_FOUND`: API endpoint doesn't exist

### Conflict Errors (409)
- `DUPLICATE_ENTRY`: Resource already exists
- `CONSTRAINT_VIOLATION`: Database constraint violated

### Server Errors (500)
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Upload endpoints**: 20 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10, max: 50)

Pagination information is included in the response:
```json
{
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total_pages": 5,
    "total_items": 50,
    "has_next": true,
    "has_prev": false
  }
}
```

## Security Considerations

1. **Input Validation**: All input is validated and sanitized
2. **HTML Sanitization**: Rich content is sanitized to prevent XSS
3. **SQL Injection Prevention**: Parameterized queries are used
4. **Authentication**: JWT tokens with expiration
5. **Authorization**: Role-based access control
6. **Rate Limiting**: Prevents API abuse
7. **CORS**: Configured for specific origins only

## Testing

All endpoints have comprehensive test coverage including:
- Unit tests for individual functions
- Integration tests for complete workflows
- Authentication and authorization tests
- Error handling tests
- Performance tests

Run tests with:
```bash
pytest server/tests/ -v
```