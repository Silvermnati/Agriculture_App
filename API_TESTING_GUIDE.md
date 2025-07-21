# Agricultural Super App API Testing Guide

This guide provides instructions for testing the Agricultural Super App API endpoints using Postman.

## Table of Contents

1. [Setup](#setup)
2. [Authentication](#authentication)
3. [User Profile](#user-profile)
4. [Communities](#communities)
5. [Community Posts](#community-posts)
6. [Experts](#experts)
7. [Consultations](#consultations)
8. [File Uploads](#file-uploads)

## Setup

### Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed
2. API server running (locally or deployed)

### Environment Setup

1. Create a new environment in Postman
2. Add the following variables:
   - `baseUrl`: `http://localhost:5001` (or your deployed API URL)
   - `token`: (leave empty for now)

## Authentication

### Register a User

- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/register`
- **Headers**: 
  - Content-Type: application/json
- **Body** (JSON):
```json
{
  "email": "farmer@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Farmer",
  "role": "farmer",
  "farm_size": 25.5,
  "farm_size_unit": "hectares",
  "farming_experience": 10,
  "farming_type": "organic"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Response has token", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
    pm.environment.set("token", jsonData.token);
});
```

### Login

- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**: 
  - Content-Type: application/json
- **Body** (JSON):
```json
{
  "email": "farmer@example.com",
  "password": "securepassword"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
    pm.environment.set("token", jsonData.token);
});
```

## User Profile

### Get Profile

- **Method**: GET
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has user data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.email).to.exist;
    pm.expect(jsonData.first_name).to.exist;
});
```

### Update Profile

- **Method**: PUT
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "first_name": "Johnny",
  "bio": "Organic farmer with 10 years of experience",
  "farm_size": 30.5,
  "farming_experience": 12
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Profile updated successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Profile updated successfully");
});
```

## Communities

### Get Communities

- **Method**: GET
- **URL**: `{{baseUrl}}/api/communities`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has communities array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.communities).to.be.an('array');
});
```

### Create Community

- **Method**: POST
- **URL**: `{{baseUrl}}/api/communities`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "name": "Organic Corn Farmers",
  "description": "A community for organic corn farmers",
  "community_type": "Crop-Specific",
  "focus_crops": ["Corn", "Wheat"],
  "location_city": "Farmville",
  "location_country": "United States",
  "is_private": false
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Community created successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Community created successfully");
    pm.expect(jsonData.community).to.exist;
    pm.environment.set("community_id", jsonData.community.community_id);
});
```

### Get Community

- **Method**: GET
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has community data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.name).to.exist;
    pm.expect(jsonData.description).to.exist;
});
```

### Join Community

- **Method**: POST
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/join`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Successfully joined community", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Successfully joined community");
});
```

## Community Posts

### Create Community Post

- **Method**: POST
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "content": "Hello everyone! I'm new to organic farming and looking for advice on pest control.",
  "image_url": "https://example.com/image.jpg"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Post created successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Post created successfully");
    pm.expect(jsonData.post).to.exist;
    pm.environment.set("post_id", jsonData.post.post_id);
});
```

### Get Community Posts

- **Method**: GET
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has posts array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.posts).to.be.an('array');
});
```

### Get Specific Post

- **Method**: GET
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts/{{post_id}}`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has post data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.content).to.exist;
    pm.expect(jsonData.user).to.exist;
});
```

### Like Post

- **Method**: POST
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts/{{post_id}}/like`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Post liked successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.liked).to.exist;
});
```

### Add Comment to Post

- **Method**: POST
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts/{{post_id}}/comments`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "content": "Welcome to the community! For organic pest control, I recommend neem oil."
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Comment added successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Comment added successfully");
    pm.expect(jsonData.comment).to.exist;
    pm.environment.set("comment_id", jsonData.comment.comment_id);
});
```

### Get Post Comments

- **Method**: GET
- **URL**: `{{baseUrl}}/api/communities/{{community_id}}/posts/{{post_id}}/comments`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has comments array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.comments).to.be.an('array');
});
```

## Experts

### Register Expert User

- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/register`
- **Headers**: 
  - Content-Type: application/json
- **Body** (JSON):
```json
{
  "email": "expert@example.com",
  "password": "securepassword",
  "first_name": "Jane",
  "last_name": "Expert",
  "role": "expert"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Response has token", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
    pm.environment.set("expert_token", jsonData.token);
    pm.environment.set("expert_id", jsonData.user.user_id);
});
```

### Create Expert Profile

- **Method**: POST
- **URL**: `{{baseUrl}}/api/experts/profile`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{expert_token}}
- **Body** (JSON):
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
  "languages_spoken": ["English", "Spanish"],
  "service_areas": [1]
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Expert profile created successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Expert profile created successfully");
});
```

### Get Experts

- **Method**: GET
- **URL**: `{{baseUrl}}/api/experts`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has experts array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.experts).to.be.an('array');
});
```

### Get Expert Profile

- **Method**: GET
- **URL**: `{{baseUrl}}/api/experts/{{expert_id}}`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has expert data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.title).to.exist;
    pm.expect(jsonData.specializations).to.exist;
});
```

## Consultations

### Book Consultation

- **Method**: POST
- **URL**: `{{baseUrl}}/api/consultations`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "expert_id": "{{expert_id}}",
  "consultation_type": "video",
  "scheduled_start": "2025-07-25T09:00:00Z",
  "scheduled_end": "2025-07-25T10:00:00Z",
  "topic": "Organic pest control for corn",
  "description": "I'm having issues with pests in my organic corn field...",
  "related_crops": [1],
  "farm_location_id": 1
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("Consultation booked successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Consultation booked successfully");
    pm.environment.set("consultation_id", jsonData.consultation.consultation_id);
});
```

### Get Consultations

- **Method**: GET
- **URL**: `{{baseUrl}}/api/consultations`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Response has consultations array", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.consultations).to.be.an('array');
});
```

### Update Consultation Status

- **Method**: PUT
- **URL**: `{{baseUrl}}/api/consultations/{{consultation_id}}/status`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{expert_token}}
- **Body** (JSON):
```json
{
  "status": "confirmed"
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Consultation status updated successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.equal("Consultation status updated successfully");
});
```

## File Uploads

### Upload File to Cloudinary

- **Method**: POST
- **URL**: `{{baseUrl}}/api/uploads`
- **Headers**: 
  - Authorization: Bearer {{token}}
- **Body** (form-data):
  - file: [select a file]
  - folder: "profile_images"
  - use_cloudinary: "true"
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 201", function() {
    pm.response.to.have.status(201);
});

pm.test("File uploaded successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("File uploaded successfully");
    pm.expect(jsonData.file_url).to.exist;
    pm.environment.set("file_url", jsonData.file_url);
    pm.environment.set("public_id", jsonData.public_id);
});
```

### Delete File from Cloudinary

- **Method**: DELETE
- **URL**: `{{baseUrl}}/api/uploads`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
- **Body** (JSON):
```json
{
  "file_url": "{{file_url}}",
  "public_id": "{{public_id}}",
  "is_cloudinary": true
}
```
- **Tests** (JavaScript):
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("File deleted successfully", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("File deleted successfully");
});
```

## Importing the Collection

You can import the complete Postman collection by following these steps:

1. Download the [Agricultural Super App API Collection](https://example.com/agricultural-super-app-api-collection.json) (replace with actual link)
2. In Postman, click "Import" in the top left
3. Upload the collection JSON file
4. Set up your environment variables as described in the [Setup](#setup) section

## Testing Workflow

For a complete testing workflow, follow these steps in order:

1. Register a user (farmer)
2. Login with the farmer account
3. Get and update the farmer's profile
4. Create a community
5. Create posts in the community
6. Like and comment on posts
7. Register an expert user
8. Create an expert profile
9. Book a consultation with the expert
10. Upload and manage files

This workflow will test all the major features of the API and ensure they're working correctly.

## Troubleshooting

### Authentication Issues

- **401 Unauthorized**: Check that your token is valid and properly formatted in the Authorization header
- **403 Forbidden**: Check that the user has the necessary permissions for the action

### Database Issues

- **404 Not Found**: Check that the resource (community, post, expert, etc.) exists
- **500 Internal Server Error**: Check the server logs for database connection issues

### File Upload Issues

- **400 Bad Request**: Check that the file is of an allowed type and size
- **500 Internal Server Error**: Check Cloudinary credentials and connection

## Additional Resources

- [API Documentation](README.md)
- [Postman Documentation](https://learning.postman.com/docs/getting-started/introduction/)
- [JWT Authentication Guide](https://jwt.io/introduction/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)