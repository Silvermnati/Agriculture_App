# Testing Follow and Notifications System

## 1. Test Follow Functionality

### Frontend Testing:
1. **Login as User A**
2. **Navigate to Posts Page** (`/posts`)
3. **Find a post by User B**
4. **Click the Follow button** on the post card
5. **Verify the button changes** to "Following"
6. **Navigate to Post Detail** (`/posts/{postId}`)
7. **Verify Follow button** shows "Following" state

### Backend API Testing:
```bash
# Test follow user
curl -X POST "http://localhost:5000/api/follow/users/{USER_B_ID}/follow" \
  -H "Authorization: Bearer {USER_A_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"notification_enabled": true}'

# Test get followers
curl -X GET "http://localhost:5000/api/follow/users/{USER_B_ID}/followers" \
  -H "Authorization: Bearer {USER_A_TOKEN}"

# Test unfollow user
curl -X DELETE "http://localhost:5000/api/follow/users/{USER_B_ID}/follow" \
  -H "Authorization: Bearer {USER_A_TOKEN}"
```

## 2. Test Notifications System

### Frontend Testing:
1. **Login as User B** (the one being followed)
2. **Check Notification Bell** in the top navigation
3. **Should see notification** about User A following them
4. **Click notification** to mark as read
5. **Verify notification count** decreases

### Backend API Testing:
```bash
# Test get notifications
curl -X GET "http://localhost:5000/api/notifications" \
  -H "Authorization: Bearer {USER_B_TOKEN}"

# Test mark notifications as read
curl -X POST "http://localhost:5000/api/notifications/mark-read" \
  -H "Authorization: Bearer {USER_B_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"notification_ids": ["{NOTIFICATION_ID}"]}'
```

## 3. Test Post Author Follow Notifications

### Complete Flow Testing:
1. **User A follows User B**
2. **User B creates a new post**
3. **User A should receive notification** about new post
4. **Verify notification appears** in User A's notification bell
5. **Click notification** to navigate to the post

## 4. Expected Behaviors

### Follow Button States:
- **Not Following**: Blue "Follow" button with + icon
- **Following**: Green "Following" button with checkmark icon
- **Loading**: Spinner with "Following..." or "Unfollowing..." text
- **Own Posts**: No follow button should appear

### Notification Types:
- **New Follower**: "John Doe started following you"
- **New Post**: "John Doe published a new post: Post Title"
- **New Comment**: "John Doe commented on your post: Post Title"

### API Response Format:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-id",
        "title": "Post Title",
        "author": {
          "user_id": "author-id",
          "name": "Author Name",
          "is_following": true
        }
      }
    ]
  }
}
```

## 5. Troubleshooting

### Common Issues:
1. **Follow button not appearing**: Check if user is logged in and not viewing own posts
2. **API 404 errors**: Verify API endpoints match frontend configuration
3. **Notifications not showing**: Check if notification routes are registered
4. **WebSocket issues**: Check browser console for connection errors

### Debug Commands:
```bash
# Check if routes are registered
flask routes | grep -E "(follow|notification)"

# Check database for follow relationships
SELECT * FROM user_follows WHERE follower_id = 'user-a-id';

# Check database for notifications
SELECT * FROM notifications WHERE user_id = 'user-b-id';
```