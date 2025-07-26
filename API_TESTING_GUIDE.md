ge# API Testing Guide for Agricultural Super App

This guide provides information about the API endpoints available in the Agricultural Super App deployed on Render.

## Base URL

All API endpoints are accessible at the base URL:
```
https://agriculture-app-1-u2a6.onrender.com
```

## Authentication Endpoints

### Register a new user
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "role": "farmer",
    "farm_size": 25.5,
    "farm_size_unit": "hectares",
    "farming_experience": 10,
    "farming_type": "organic"
  }
  ```
- **Response**: Returns user data and authentication token
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"securepassword","first_name":"John","last_name":"Doe","role":"farmer","farm_size":25.5,"farm_size_unit":"hectares","farming_experience":10,"farming_type":"organic"}'
  ```

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: Returns user data and authentication token
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"securepassword"}'
  ```

### Get User Profile
- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns user profile data
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/auth/profile \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

### Update User Profile
- **URL**: `/api/auth/profile`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "first_name": "Johnny",
    "bio": "Organic farmer with 10 years of experience",
    "farm_size": 30.5,
    "farming_experience": 12
  }
  ```
- **Response**: Returns success message
- **Test Command**:
  ```bash
  curl -X PUT https://agriculture-app-1-u2a6.onrender.com/api/auth/profile \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"first_name":"Johnny","bio":"Organic farmer with 10 years of experience","farm_size":30.5,"farming_experience":12}'
  ```

## Community Endpoints

### Get All Communities
- **URL**: `/api/communities`
- **Method**: `GET`
- **Response**: Returns list of communities
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/communities
  ```

### Create Community
- **URL**: `/api/communities`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "name": "Organic Farmers",
    "description": "A community for organic farmers",
    "community_type": "Crop-Specific",
    "focus_crops": ["Corn", "Wheat"],
    "location_city": "Test City",
    "location_country": "Test Country",
    "is_private": false
  }
  ```
- **Response**: Returns created community data
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/communities \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"name":"Organic Farmers","description":"A community for organic farmers","community_type":"Crop-Specific","focus_crops":["Corn","Wheat"],"location_city":"Test City","location_country":"Test Country","is_private":false}'
  ```

### Get Community Details
- **URL**: `/api/communities/{community_id}`
- **Method**: `GET`
- **Response**: Returns community details
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE
  ```

### Update Community
- **URL**: `/api/communities/{community_id}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "description": "Updated community description",
    "focus_crops": ["Corn", "Wheat", "Soybeans"]
  }
  ```
- **Response**: Returns success message
- **Test Command**:
  ```bash
  curl -X PUT https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"description":"Updated community description","focus_crops":["Corn","Wheat","Soybeans"]}'
  ```

### Join Community
- **URL**: `/api/communities/{community_id}/join`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns success message
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE/join \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

### Get Community Posts
- **URL**: `/api/communities/{community_id}/posts`
- **Method**: `GET`
- **Response**: Returns list of posts in the community
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE/posts
  ```

### Create Community Post
- **URL**: `/api/communities/{community_id}/posts`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "This is a test post",
    "image_url": "https://example.com/image.jpg"
  }
  ```
- **Response**: Returns created post data
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE/posts \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"content":"This is a test post","image_url":"https://example.com/image.jpg"}'
  ```

### Like a Post
- **URL**: `/api/communities/{community_id}/posts/{post_id}/like`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns success message
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE/posts/POST_ID_HERE/like \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

### Comment on a Post
- **URL**: `/api/communities/{community_id}/posts/{post_id}/comments`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "This is a test comment"
  }
  ```
- **Response**: Returns created comment data
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/communities/COMMUNITY_ID_HERE/posts/POST_ID_HERE/comments \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"content":"This is a test comment"}'
  ```

## Post Endpoints

### Get All Posts
- **URL**: `/api/posts`
- **Method**: `GET`
- **Response**: Returns a list of all posts.
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/posts
  ```

### Create a Post
- **URL**: `/api/posts`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "This is a new post.",
    "image_url": "http://example.com/image.png"
  }
  ```
- **Response**: Returns the created post data.
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/posts \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"content":"This is a new post.","image_url":"http://example.com/image.png"}'
  ```

### Get a Single Post
- **URL**: `/api/posts/{post_id}`
- **Method**: `GET`
- **Response**: Returns the details of a single post.
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/posts/POST_ID_HERE
  ```

### Update a Post
- **URL**: `/api/posts/{post_id}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "This is an updated post."
  }
  ```
- **Response**: Returns a success message.
- **Test Command**:
  ```bash
  curl -X PUT https://agriculture-app-1-u2a6.onrender.com/api/posts/POST_ID_HERE \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"content":"This is an updated post."}'
  ```

### Delete a Post
- **URL**: `/api/posts/{post_id}`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns a success message.
- **Test Command**:
  ```bash
  curl -X DELETE https://agriculture-app-1-u2a6.onrender.com/api/posts/POST_ID_HERE \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

### Add a Comment to a Post
- **URL**: `/api/posts/{post_id}/comments`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "content": "This is a comment."
  }
  ```
- **Response**: Returns the created comment data.
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/posts/POST_ID_HERE/comments \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"content":"This is a comment."}'
  ```

### Toggle Like on a Post
- **URL**: `/api/posts/{post_id}/like`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns a success message.
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/posts/POST_ID_HERE/like \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

## Expert Endpoints


### Get All Experts
- **URL**: `/api/experts`
- **Method**: `GET`
- **Response**: Returns list of experts
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/experts
  ```

### Get Expert Profile
- **URL**: `/api/experts/{expert_id}`
- **Method**: `GET`
- **Response**: Returns expert profile details
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/experts/EXPERT_ID_HERE
  ```

### Create Expert Profile
- **URL**: `/api/experts`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "title": "Agricultural Scientist",
    "specializations": ["Corn", "Wheat", "Organic Farming"],
    "certification": "PhD in Agricultural Science",
    "education": "University of Agriculture",
    "years_experience": 15,
    "hourly_rate": 50.00,
    "currency": "USD",
    "availability_status": "available",
    "languages_spoken": ["English", "Spanish"]
  }
  ```
- **Response**: Returns created expert profile data
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/experts \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"title":"Agricultural Scientist","specializations":["Corn","Wheat","Organic Farming"],"certification":"PhD in Agricultural Science","education":"University of Agriculture","years_experience":15,"hourly_rate":50.00,"currency":"USD","availability_status":"available","languages_spoken":["English","Spanish"]}'
  ```

### Book Consultation
- **URL**: `/api/consultations`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "expert_id": "EXPERT_ID_HERE",
    "topic": "Organic Farming Techniques",
    "description": "I need advice on organic farming techniques for corn",
    "scheduled_start": "2025-07-25T10:00:00Z",
    "scheduled_end": "2025-07-25T11:00:00Z"
  }
  ```
- **Response**: Returns created consultation data
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/consultations \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -H "Content-Type: application/json" \
    -d '{"expert_id":"EXPERT_ID_HERE","topic":"Organic Farming Techniques","description":"I need advice on organic farming techniques for corn","scheduled_start":"2025-07-25T10:00:00Z","scheduled_end":"2025-07-25T11:00:00Z"}'
  ```

### Get User Consultations
- **URL**: `/api/consultations`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Returns list of user's consultations
- **Test Command**:
  ```bash
  curl -X GET https://agriculture-app-1-u2a6.onrender.com/api/consultations \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```

## File Upload Endpoints

### Upload File
- **URL**: `/api/upload`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Body**: Form data with file
- **Response**: Returns uploaded file URL
- **Test Command**:
  ```bash
  curl -X POST https://agriculture-app-1-u2a6.onrender.com/api/upload \
    -H "Authorization: Bearer YOUR_TOKEN_HERE" \
    -F "file=@/path/to/your/file.jpg"
  ```

## Testing Notes

1. Replace `YOUR_TOKEN_HERE` with the actual authentication token received after login.
2. Replace `COMMUNITY_ID_HERE`, `POST_ID_HERE`, and `EXPERT_ID_HERE` with actual IDs from your database.
3. For endpoints that require authentication, make sure to include the Authorization header with a valid token.
4. All requests that include a body should have the Content-Type header set to application/json.
5. For file uploads, use multipart/form-data instead of application/json.

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Success
- 201: Resource created
- 400: Bad request (invalid input)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 409: Conflict (e.g., duplicate email)
- 500: Server error

Error responses include a message field with details about the error.