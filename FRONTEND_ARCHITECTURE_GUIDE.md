# Agricultural Super App - Frontend Architecture Guide

## Overview

This is a comprehensive React-based frontend application for an Agricultural Super App. The frontend provides a modern, responsive user interface for farmers, agricultural experts, suppliers, researchers, and students to connect, share knowledge, and collaborate.

## Technology Stack

### Core Technologies
- **Framework**: React 18.2.0 with functional components and hooks
- **Build Tool**: Vite 4.5.0 for fast development and optimized builds
- **State Management**: Redux Toolkit (@reduxjs/toolkit 2.0.1) with Redux Persist
- **Routing**: React Router DOM 6.20.1 for client-side navigation
- **Styling**: Tailwind CSS 3.4.17 for utility-first styling
- **HTTP Client**: Axios 1.6.2 for API communication
- **Form Handling**: React Hook Form 7.48.2 for efficient form management

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@reduxjs/toolkit": "^2.0.1",
  "react-redux": "^9.0.2",
  "react-router-dom": "^6.20.1",
  "axios": "^1.6.2",
  "react-hook-form": "^7.48.2",
  "tailwindcss": "^3.4.17",
  "react-toastify": "^9.1.3",
  "react-icons": "^4.12.0",
  "lucide-react": "^0.294.0"
}
```

### Development & Testing Tools
- **Testing**: Vitest + React Testing Library + MSW for mocking
- **Linting**: ESLint with React-specific rules
- **Type Safety**: JSDoc comments and TypeScript definitions where needed
- **Development Server**: Vite dev server with HMR

## Project Structure

```
client/
├── public/                     # Static assets
├── src/
│   ├── __tests__/             # Test files
│   │   ├── components/        # Component tests
│   │   ├── integration/       # Integration tests
│   │   └── store/            # Redux store tests
│   ├── assets/               # Images, icons, static files
│   ├── components/           # Reusable UI components
│   │   ├── Admin/           # Admin-specific components
│   │   ├── Auth/            # Authentication components
│   │   ├── common/          # Shared/common components
│   │   ├── communities/     # Community-related components
│   │   ├── Experts/         # Expert consultation components
│   │   ├── Layout/          # Layout components
│   │   ├── Notifications/   # Notification components
│   │   ├── posts/           # Post/article components
│   │   └── Profile/         # User profile components
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page-level components
│   │   ├── Admin/          # Admin dashboard pages
│   │   ├── Communities/    # Community pages
│   │   ├── Experts/        # Expert consultation pages
│   │   ├── Home/           # Home page
│   │   ├── Login/          # Authentication pages
│   │   ├── Notifications/  # Notification pages
│   │   ├── posts/          # Post management pages
│   │   ├── Profile/        # User profile pages
│   │   └── Register/       # Registration pages
│   ├── services/           # External service integrations
│   ├── store/              # Redux store configuration
│   │   └── slices/         # Redux slices
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions and helpers
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── vitest.config.js        # Testing configuration
```

## Architecture Patterns

### 1. Component-Based Architecture

The application follows a **component-based architecture** with clear separation of concerns:

#### **Atomic Design Principles**
- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Simple component combinations (form fields, cards)
- **Organisms**: Complex UI sections (navigation, post lists)
- **Templates**: Page layouts and structures
- **Pages**: Complete page implementations

#### **Component Categories**
```
components/
├── common/              # Reusable UI components
│   ├── ApiErrorHandler/ # Error handling components
│   ├── ErrorBoundary/   # React error boundaries
│   ├── FileUpload/      # File upload components
│   ├── FollowButton/    # User following functionality
│   ├── FormField/       # Form input components
│   ├── Image/           # Image display components
│   ├── MpesaPaymentModal/ # Payment integration
│   ├── PasswordField/   # Password input components
│   ├── PaymentHistory/  # Payment history display
│   ├── PhoneNumberField/ # Phone input components
│   └── Toast/           # Notification toasts
├── posts/               # Post-related components
│   ├── PostCard.jsx     # Individual post display
│   ├── PostList.jsx     # List of posts
│   ├── PostForm.jsx     # Post creation/editing
│   ├── PostActions.jsx  # Like, share, comment actions
│   ├── PostFilters.jsx  # Post filtering controls
│   ├── CommentSection.jsx # Comments display
│   └── CommentForm.jsx  # Comment creation
└── Profile/             # User profile components
    ├── ProfileHeader.jsx    # Profile header display
    ├── ProfileTabs.jsx      # Profile navigation tabs
    ├── OverviewTab.jsx      # Profile overview
    ├── EditProfileTab.jsx   # Profile editing
    └── ExpertProfileTab.jsx # Expert-specific profile
```

### 2. State Management Architecture

The application uses **Redux Toolkit** with a slice-based architecture:

#### **Store Configuration**
```javascript
// src/store/index.js
export const store = configureStore({
  reducer: {
    auth: authReducer,           // Authentication state
    posts: postsReducer,         // Posts and articles
    experts: expertsReducer,     // Expert consultation
    communities: communitiesReducer, // Community features
    profile: profileReducer,     // User profile data
  },
});
```

#### **Redux Slices**
Each slice manages a specific domain of the application:

**Authentication Slice (`authSlice.js`)**
- User authentication state
- Login/logout functionality
- Profile management
- Token handling

**Posts Slice (`postsSlice.js`)**
- Post creation, editing, deletion
- Post listing and filtering
- Comments and likes
- Post interactions

**Communities Slice (`communitiesSlice.js`)**
- Community management
- Community posts
- Member interactions

**Experts Slice (`expertsSlice.js`)**
- Expert profiles
- Consultation booking
- Expert reviews

**Profile Slice (`profileSlice.js`)**
- User profile data
- Profile completion tracking
- Settings management

#### **Async Actions with Redux Toolkit**
```javascript
// Example from postsSlice.js
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, thunkAPI) => {
    try {
      const response = await postsAPI.createPost(postData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create post'
      );
    }
  }
);
```

### 3. Routing Architecture

The application uses **React Router DOM** with protected routes:

#### **Route Structure**
```javascript
// App.jsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  
  {/* Protected routes */}
  <Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
  <Route path="/communities" element={<ProtectedRoute><CommunitiesPage /></ProtectedRoute>} />
  <Route path="/experts" element={<ProtectedRoute><ExpertsPage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  
  {/* Admin routes */}
  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
</Routes>
```

#### **Route Protection**
```javascript
// Protected route implementation
const AppRoutes = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  return (
    <Routes>
      <Route 
        path="/posts" 
        element={isAuthenticated ? <PostsPage /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
};
```

### 4. API Integration Architecture

The application uses **Axios** with a centralized API configuration:

#### **API Client Setup**
```javascript
// src/utils/api.js
const api = axios.create({
  baseURL: 'https://agriculture-app-1-u2a6.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### **API Modules**
```javascript
// Organized API calls by domain
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

export const postsAPI = {
  getPosts: (params) => api.get('/posts', { params }),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
};
```

#### **Error Handling**
```javascript
// Global error handling in API interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Key Features Implementation

### 1. Authentication System

#### **JWT Token Management**
- Automatic token inclusion in API requests
- Token expiration handling
- Secure token storage in localStorage
- Automatic logout on token expiration

#### **User Registration & Login**
```javascript
// Registration with form validation
const handleRegister = async (formData) => {
  try {
    await dispatch(register(formData)).unwrap();
    navigate('/');
    toast.success('Registration successful!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 2. Post Management System

#### **Rich Text Editor Integration**
- React Quill for rich text editing
- Image upload support
- Agricultural tagging system
- Category and crop association

#### **Post Interactions**
```javascript
// Like/unlike functionality
const handleLike = async (postId) => {
  try {
    await dispatch(toggleLike(postId)).unwrap();
  } catch (error) {
    toast.error('Failed to like post');
  }
};
```

### 3. Community Features

#### **Community Management**
- Community creation and joining
- Role-based permissions (admin, moderator, member)
- Community-specific posts and discussions
- Location and crop-based communities

#### **Real-time Features (Planned)**
```javascript
// WebSocket integration (currently disabled)
useEffect(() => {
  if (isAuthenticated && user) {
    // WebSocket connection for real-time updates
    // Currently disabled for stability
  }
}, [isAuthenticated, user]);
```

### 4. Expert Consultation System

#### **Expert Profiles**
- Detailed expert information
- Specialization and experience display
- Rating and review system
- Availability scheduling

#### **Consultation Booking**
- Calendar integration
- Payment processing with M-Pesa
- Video call integration (planned)
- Consultation history

### 5. File Upload System

#### **Image Upload with Preview**
```javascript
// File upload component
const FileUpload = ({ onFileSelect, accept, maxSize }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= maxSize) {
      onFileSelect(file);
    }
  };
  
  return (
    <input
      type="file"
      accept={accept}
      onChange={handleFileChange}
      className="hidden"
    />
  );
};
```

### 6. Responsive Design

#### **Mobile-First Approach**
- Tailwind CSS utility classes
- Responsive breakpoints
- Touch-friendly interfaces
- Progressive Web App features (planned)

#### **Component Responsiveness**
```javascript
// Responsive grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {posts.map(post => (
    <PostCard key={post.id} post={post} />
  ))}
</div>
```

## Performance Optimizations

### 1. Code Splitting

#### **Route-Based Code Splitting**
```javascript
// Lazy loading for better performance
const PostsPage = lazy(() => import('./pages/posts/PostsPage'));
const CommunitiesPage = lazy(() => import('./pages/Communities/CommunitiesPage'));

// Wrapped with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <PostsPage />
</Suspense>
```

### 2. State Management Optimization

#### **Selective Re-rendering**
```javascript
// Using useSelector with equality checks
const posts = useSelector(state => state.posts.posts, shallowEqual);
const isLoading = useSelector(state => state.posts.isLoading);
```

#### **Memoization**
```javascript
// Memoized components for expensive renders
const PostCard = memo(({ post }) => {
  return (
    <div className="post-card">
      {/* Post content */}
    </div>
  );
});
```

### 3. Image Optimization

#### **Lazy Loading**
```javascript
// Image component with lazy loading
const Image = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        e.target.src = '/placeholder-image.jpg';
      }}
    />
  );
};
```

## Testing Strategy

### 1. Unit Testing

#### **Component Testing**
```javascript
// Example component test
describe('PostCard', () => {
  it('renders post information correctly', () => {
    const mockPost = {
      id: '1',
      title: 'Test Post',
      content: 'Test content',
      author: { name: 'Test Author' }
    };
    
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });
});
```

#### **Redux Store Testing**
```javascript
// Store slice testing
describe('authSlice', () => {
  it('should handle login success', () => {
    const initialState = { user: null, isAuthenticated: false };
    const action = { type: 'auth/login/fulfilled', payload: { user: mockUser } };
    
    const newState = authReducer(initialState, action);
    
    expect(newState.user).toEqual(mockUser);
    expect(newState.isAuthenticated).toBe(true);
  });
});
```

### 2. Integration Testing

#### **API Integration Tests**
```javascript
// API integration testing with MSW
beforeEach(() => {
  server.use(
    rest.get('/api/posts', (req, res, ctx) => {
      return res(ctx.json({ success: true, data: mockPosts }));
    })
  );
});
```

### 3. End-to-End Testing (Planned)

#### **User Journey Testing**
- Complete user registration flow
- Post creation and interaction
- Community joining and participation
- Expert consultation booking

## Build and Deployment

### 1. Development Build

#### **Vite Configuration**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://agriculture-app-1-u2a6.onrender.com',
        changeOrigin: true,
      },
    },
  },
});
```

### 2. Production Build

#### **Build Optimization**
- Tree shaking for unused code elimination
- Asset optimization and compression
- Bundle splitting for better caching
- Environment-specific configurations

#### **Build Commands**
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### 3. Deployment Strategy

#### **Static Site Deployment**
- Built for deployment on CDN/static hosting
- Environment variable configuration
- API proxy configuration for development
- Production API endpoint configuration

## Security Considerations

### 1. Authentication Security

#### **Token Management**
- Secure token storage
- Automatic token refresh (planned)
- Token expiration handling
- Logout on security events

### 2. Input Validation

#### **Form Validation**
```javascript
// React Hook Form with validation
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(validationSchema)
});

const validationSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});
```

### 3. XSS Prevention

#### **Content Sanitization**
- HTML content sanitization
- Safe rendering of user-generated content
- CSP headers (server-side)

## Future Enhancements

### 1. Progressive Web App (PWA)
- Service worker implementation
- Offline functionality
- Push notifications
- App-like experience on mobile

### 2. Real-time Features
- WebSocket integration for live updates
- Real-time chat functionality
- Live consultation features
- Instant notifications

### 3. Advanced Features
- Advanced search with filters
- AI-powered content recommendations
- Multi-language support (i18n)
- Dark mode theme support

### 4. Performance Improvements
- Virtual scrolling for large lists
- Advanced caching strategies
- Image optimization and CDN integration
- Bundle size optimization

## Development Guidelines

### 1. Code Style

#### **Component Structure**
```javascript
// Standard component structure
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const dispatch = useDispatch();
  const stateValue = useSelector(state => state.slice.value);
  const [localState, setLocalState] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### 2. State Management Guidelines

#### **Redux Best Practices**
- Use Redux Toolkit for all state management
- Keep state normalized
- Use async thunks for API calls
- Handle loading and error states consistently

### 3. Styling Guidelines

#### **Tailwind CSS Usage**
- Use utility classes for styling
- Create custom components for repeated patterns
- Maintain consistent spacing and colors
- Use responsive design principles

This frontend architecture provides a solid, scalable foundation for the Agricultural Super App with modern React patterns, efficient state management, and comprehensive feature coverage for agricultural community building and knowledge sharing.