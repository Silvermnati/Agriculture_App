# API Integration Guide

This guide explains how to test and use the updated frontend API integration with the render backend.

## Overview

The frontend has been updated to work seamlessly with the render API backend. All authentication, post management, and profile functionality has been integrated and tested.

## What's Been Implemented

### 1. Authentication System
- **Login**: Users can log in with email/password
- **Registration**: New users can register with agricultural profile data
- **Profile Management**: Users can view and update their profiles
- **Token Management**: JWT tokens are handled automatically

### 2. Posts Management
- **Create Posts**: Authenticated users can create posts with agricultural context
- **View Posts**: All users can view published posts
- **Update/Delete Posts**: Post authors can modify their posts
- **Comments & Likes**: Full interaction functionality

### 3. Data Transformation
- **Backend Compatibility**: All data is properly transformed between frontend and backend formats
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Response Processing**: Handles both success and error responses consistently

## Testing the Integration

### Access the Test Page
1. Start the frontend development server
2. Navigate to `/api-test` in your browser
3. Use the test buttons to verify functionality

### Test Scenarios

#### 1. Authentication Tests
```javascript
// Test Login (use existing user credentials)
Email: test@example.com
Password: testpassword123

// Test Registration (creates new user)
- Automatically generates unique email
- Creates farmer profile with sample data
```

#### 2. Posts Tests
```javascript
// Test Get Posts
- Fetches all published posts
- Displays post count and sample posts

// Test Create Post (requires authentication)
- Creates a test post with agricultural data
- Includes crops, locations, and seasonal relevance
```

### Expected Results

#### Successful Login Response
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "user_id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "farmer",
      // ... other user fields
    }
  }
}
```

#### Successful Post Creation Response
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "title": "Test Post",
      "content": "<p>Content here</p>",
      "author": {
        "name": "John Doe",
        "avatar_url": "...",
        "role": "farmer"
      },
      "related_crops": ["corn", "wheat"],
      "applicable_locations": ["nairobi", "nakuru"],
      // ... other post fields
    }
  }
}
```

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/{id}` - Get specific post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Toggle like
- `GET/POST /api/posts/{id}/comments` - Get/Add comments

### Additional Endpoints (Available but not in test)
- Articles: `/api/articles/*`
- Crops: `/api/crops/*`, `/api/user-crops/*`
- Locations: `/api/locations/*`
- Categories: `/api/categories/*`
- Tags: `/api/tags/*`
- Reviews: `/api/reviews/*`

## Error Handling

The system includes comprehensive error handling:

### Network Errors
- Connection timeouts
- Server unavailable
- DNS resolution issues

### Authentication Errors
- Invalid credentials
- Expired tokens
- Insufficient permissions

### Validation Errors
- Missing required fields
- Invalid data formats
- Business rule violations

### Server Errors
- Internal server errors
- Database connection issues
- Rate limiting

## Data Transformation

### User Data
The system automatically transforms user data between frontend and backend formats:

**Frontend Format:**
```javascript
{
  id: "uuid",
  first_name: "John",
  last_name: "Doe",
  location: {
    city: "Nairobi",
    country: "Kenya"
  },
  // ... other fields
}
```

**Backend Format:**
```javascript
{
  user_id: "uuid",
  first_name: "John",
  last_name: "Doe",
  city: "Nairobi",
  country: "Kenya",
  // ... other fields
}
```

### Post Data
Posts are transformed to include proper field names and nested objects:

**Frontend Display:**
```javascript
{
  id: "uuid",
  title: "Post Title",
  author: {
    name: "John Doe",
    avatar_url: "...",
    role: "farmer"
  },
  like_count: 5,
  comment_count: 3,
  // ... other fields
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the backend allows requests from your frontend domain
   - Check that the API URL is correct

2. **Authentication Failures**
   - Verify user credentials exist in the backend
   - Check that JWT tokens are being sent correctly

3. **Data Format Errors**
   - Ensure arrays are properly formatted (JSON strings for form data)
   - Check that required fields are included

4. **Network Issues**
   - Verify the render API is accessible
   - Check internet connection
   - Look for rate limiting

### Debug Information

The test component logs detailed information to the browser console:
- API request details
- Response data structure
- Error messages and stack traces

### Browser Developer Tools

Use the Network tab to inspect:
- Request headers (Authorization token)
- Request payload
- Response status and data
- Error responses

## Next Steps

1. **Remove Test Components**: Remove the API test route and navigation link in production
2. **Add More Tests**: Extend testing to cover all CRUD operations
3. **Error Monitoring**: Implement error tracking for production
4. **Performance Optimization**: Add caching and request optimization
5. **User Feedback**: Add loading states and success messages throughout the app

## Production Considerations

### Security
- Ensure HTTPS is used in production
- Implement proper token refresh mechanisms
- Add request rate limiting on the frontend

### Performance
- Implement request caching where appropriate
- Add loading states for better UX
- Optimize bundle size

### Monitoring
- Add error tracking (e.g., Sentry)
- Monitor API response times
- Track user authentication flows

### Accessibility
- Ensure error messages are accessible
- Add proper ARIA labels
- Test with screen readers