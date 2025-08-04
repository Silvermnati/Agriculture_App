# AgriConnect - Agricultural Super App

A comprehensive full-stack agricultural platform that connects farmers, agricultural experts, suppliers, researchers, and students worldwide. AgriConnect facilitates knowledge sharing, expert consultations, community building, and collaborative learning within the agricultural sector.

## 🌾 Overview

AgriConnect is designed to bridge the gap between traditional farming practices and modern agricultural technology. The platform provides a digital space where agricultural knowledge flows freely, enabling users to:

- **Connect** with fellow farmers and agricultural experts globally
- **Share** farming experiences, techniques, and best practices
- **Learn** from expert consultations and community discussions
- **Collaborate** on agricultural projects and research
- **Access** curated agricultural content and resources

## ✨ Key Features
- Secure JWT-based authentication and authorization
- Role-based access control (Farmers, Experts, Admins)
- Comprehensive user profiles with agricultural specializations
- Account management and privacy controls

### 🏘️ Community Platform

- Create and join agricultural communities by crop type, region, or interest
- Community-specific discussions and knowledge sharing
- Moderated content to ensure quality and relevance
- Community analytics and engagement metrics

### 📝 Content Management

- Create, edit, and share agricultural posts with rich media
- Comment and like system for community engagement
- Tag-based content organization and discovery
- Search functionality across posts and communities

### 👨‍🌾 Expert Consultation System

- Browse and connect with verified agricultural experts
- Book one-on-one consultations with specialists
- Expert profiles with credentials and specializations
- Consultation history and follow-up support

### 📱 Modern User Experience

- Responsive design for desktop, tablet, and mobile
- Real-time notifications and updates
- Intuitive navigation and user interface
- Accessibility-compliant design

### 🛡️ Admin Dashboard

- Comprehensive admin panel for platform management
- User, community, and content moderation tools
- Analytics and reporting capabilities
- System monitoring and maintenance tools

## 🏗️ Architecture

### Frontend (React + Vite)

- **Framework**: React 18.2.0 with modern hooks and functional components
- **Build Tool**: Vite for fast development and optimized production builds
- **State Management**: Redux Toolkit with Redux Persist for state persistence
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS for utility-first responsive design
- **HTTP Client**: Axios for API communication
- **Form Handling**: React Hook Form for efficient form management
- **UI Components**: Lucide React icons and custom components

### Backend (Flask + PostgreSQL)

- **Framework**: Flask 2.3.3 with SQLAlchemy ORM
- **Database**: PostgreSQL for robust data storage
- **Authentication**: JWT tokens for secure API access
- **File Storage**: Cloudinary integration for image uploads
- **API Design**: RESTful API with comprehensive endpoint coverage
- **Testing**: pytest with comprehensive test coverage
- **Deployment**: Gunicorn WSGI server, Render.com compatible

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+** for backend development
- **Node.js 18+** and **npm/yarn** for frontend development
- **PostgreSQL 12+** for database
- **Git** for version control

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd agricultural-super-app
   ```

2. **Create and activate virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.flaskenv` file in the root directory:

   ```env
   FLASK_APP=run.py
   FLASK_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/agri_app_dev
   SECRET_KEY=your-secret-key-here
   JWT_SECRET_KEY=your-jwt-secret-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Initialize the database**

   ```bash
   flask db upgrade
   ```

6. **Run the backend server**
   ```bash
   flask run
   # Server will start on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # Server will start on http://localhost:5173
   ```

### Development Workflow

1. **Backend Development**
   - API endpoints are in `server/routes/`
   - Business logic in `server/controllers/`
   - Database models in `server/models/`
   - Run tests: `pytest`

2. **Frontend Development**
   - Components in `client/src/components/`
   - Pages in `client/src/pages/`
   - Redux store in `client/src/store/`
   - Run tests: `npm run test`

3. **Database Migrations**

   ```bash
   # Create new migration
   flask db migrate -m "Description of changes"

   # Apply migrations
   flask db upgrade
   ```

## 📁 Project Structure

```
agricultural-super-app/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Admin/              # Admin-specific components
│   │   │   ├── Layout/             # Layout components
│   │   │   ├── Navigation/         # Navigation components
│   │   │   └── common/             # Common UI components
│   │   ├── pages/                  # Page components
│   │   │   ├── About/              # About page
│   │   │   ├── Admin/              # Admin dashboard
│   │   │   ├── Communities/        # Community pages
│   │   │   ├── Contact/            # Contact page
│   │   │   ├── Experts/            # Expert pages
│   │   │   ├── Home/               # Home page
│   │   │   ├── Login/              # Authentication pages
│   │   │   ├── Privacy/            # Privacy policy
│   │   │   ├── Profile/            # User profile
│   │   │   ├── Terms/              # Terms of service
│   │   │   └── posts/              # Post-related pages
│   │   ├── store/                  # Redux store configuration
│   │   ├── services/               # API service functions
│   │   ├── utils/                  # Utility functions
│   │   └── __tests__/              # Test files
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
├── server/                         # Backend Flask application
│   ├── controllers/                # Business logic controllers
│   ├── models/                     # Database models
│   ├── routes/                     # API route definitions
│   ├── services/                   # Business services
│   ├── utils/                      # Utility functions
│   └── tests/                      # Backend tests
├── migrations/                     # Database migration files
├── requirements.txt                # Python dependencies
├── Pipfile                        # Pipenv configuration
├── render.yaml                    # Render deployment config
├── wsgi.py                        # WSGI entry point
├── run.py                         # Development server entry
└── README.md                      # This file
```

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=server

# Run specific test file
pytest server/tests/test_auth.py

# Run tests in verbose mode
pytest -v
```

### Frontend Testing

```bash
cd client

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- components/Navigation.test.jsx
```

## 🔧 Configuration

### Environment Variables

#### Backend (.flaskenv)

```env
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/agri_app_dev

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional: Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

#### Frontend (client/.env)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=AgriConnect
VITE_APP_VERSION=1.0.0
```

## 🚀 Deployment to Render

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Name**: agricultural-super-app-api
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
4. Add the following environment variables:
   - `FLASK_ENV`: production
   - `SECRET_KEY`: (generate a secure random string)
   - `JWT_SECRET_KEY`: (generate a secure random string)
   - `DATABASE_URL`: (will be provided by Render if you create a PostgreSQL database)
   - `CLOUDINARY_CLOUD_NAME`: your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: your Cloudinary API secret
5. Create a PostgreSQL database on Render and link it to your web service

### Automatic Deployment with render.yaml

1. Push the repository with the `render.yaml` file to GitHub
2. Go to the Render Dashboard and click "New" > "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file and set up the services
5. Add your Cloudinary credentials in the environment variables section

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get JWT token
- `GET /api/auth/profile`: Get current user profile
- `PUT /api/auth/profile`: Update user profile

### Community Endpoints

- `GET /api/communities`: Get all communities
- `POST /api/communities`: Create a new community
- `GET /api/communities/{id}`: Get a specific community
- `PUT /api/communities/{id}`: Update a community
- `DELETE /api/communities/{id}`: Delete a community
- `POST /api/communities/{id}/join`: Join a community

### Post Endpoints

- `GET /api/communities/{id}/posts`: Get posts for a community
- `POST /api/communities/{id}/posts`: Create a post in a community
- `GET /api/communities/{id}/posts/{post_id}`: Get a specific post
- `PUT /api/communities/{id}/posts/{post_id}`: Update a post
- `DELETE /api/communities/{id}/posts/{post_id}`: Delete a post
- `POST /api/communities/{id}/posts/{post_id}/like`: Like/unlike a post
- `GET /api/communities/{id}/posts/{post_id}/comments`: Get comments for a post
- `POST /api/communities/{id}/posts/{post_id}/comments`: Add a comment to a post

### Expert Endpoints

- `GET /api/experts`: Get all experts
- `GET /api/experts/{id}`: Get a specific expert
- `POST /api/experts/profile`: Create/update expert profile
- `POST /api/consultations`: Book a consultation
- `GET /api/consultations`: Get user's consultations

### Upload Endpoints

- `POST /api/uploads`: Upload a file (supports Cloudinary)
- `DELETE /api/uploads`: Delete a file

### Admin Endpoints

- `GET /api/admin/users`: Get all users (admin only)
- `PUT /api/admin/users/{id}`: Update user status (admin only)
- `DELETE /api/admin/users/{id}`: Delete user (admin only)
- `GET /api/admin/communities`: Get all communities (admin only)
- `GET /api/admin/posts`: Get all posts (admin only)
- `GET /api/admin/analytics`: Get platform analytics (admin only)

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### Development Process

1. **Fork the repository** and create your feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards
   - Follow PEP 8 for Python code
   - Use ESLint configuration for JavaScript/React code
   - Write meaningful commit messages
   - Add tests for new functionality

3. **Test your changes**

   ```bash
   # Backend tests
   pytest

   # Frontend tests
   cd client && npm run test
   ```

4. **Submit a pull request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass
   - Request review from maintainers

### Code Style Guidelines

- **Python**: Follow PEP 8, use type hints where appropriate
- **JavaScript/React**: Use ESLint configuration, prefer functional components
- **CSS**: Use Tailwind CSS utility classes, avoid custom CSS when possible
- **Documentation**: Update README and inline documentation for new features

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide detailed reproduction steps for bugs
- Include environment information (OS, Python/Node versions)
- Search existing issues before creating new ones

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**Database Connection Error**

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify database exists
psql -U postgres -l

# Check environment variables
echo $DATABASE_URL
```

**Migration Issues**

```bash
# Reset migrations (development only)
flask db downgrade
flask db upgrade

# Create new migration
flask db migrate -m "Description"
```

**Import Errors**

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Frontend Issues

**Node Modules Issues**

```bash
# Clear npm cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

**Build Errors**

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear Vite cache
npm run dev -- --force
```

**API Connection Issues**

- Verify backend server is running on port 5000
- Check CORS configuration in Flask app
- Verify API base URL in frontend environment variables

### Performance Optimization

#### Backend

- Use database indexing for frequently queried fields
- Implement pagination for large data sets
- Use Redis for caching (optional)
- Monitor database query performance

#### Frontend

- Implement lazy loading for routes and components
- Optimize images and assets
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## 📊 Monitoring and Analytics

### Application Metrics

- User registration and engagement rates
- Community activity and growth
- Expert consultation booking rates
- Content creation and interaction metrics

### Technical Metrics

- API response times and error rates
- Database query performance
- Frontend bundle size and load times
- Server resource utilization

## 🔒 Security Considerations

### Authentication & Authorization

- JWT tokens with appropriate expiration times
- Role-based access control implementation
- Secure password hashing with bcrypt
- Input validation and sanitization

### Data Protection

- HTTPS enforcement in production
- SQL injection prevention through ORM
- XSS protection with content sanitization
- CSRF protection for state-changing operations

### Privacy Compliance

- User data encryption at rest and in transit
- GDPR compliance for EU users
- User consent management
- Data retention and deletion policies

## 🌍 Internationalization

The platform is designed to support multiple languages and regions:

- **Backend**: Flask-Babel for message translation
- **Frontend**: React i18n for UI translations
- **Database**: UTF-8 encoding for multilingual content
- **Localization**: Date, time, and number formatting

## 📱 Mobile Support

- **Responsive Design**: Tailwind CSS breakpoints for all screen sizes
- **Touch Optimization**: Mobile-friendly interactions and gestures
- **Performance**: Optimized for mobile network conditions
- **PWA Ready**: Service worker and manifest configuration

## 🚀 Future Roadmap

### Planned Features

- [ ] Mobile applications (iOS/Android)
- [ ] Real-time chat and messaging
- [ ] Video consultation capabilities
- [ ] AI-powered crop disease detection
- [ ] Weather integration and alerts
- [ ] Marketplace for agricultural products
- [ ] Multi-language support
- [ ] Offline functionality

### Technical Improvements

- [ ] GraphQL API implementation
- [ ] Microservices architecture
- [ ] Container orchestration with Kubernetes
- [ ] Advanced caching strategies
- [ ] Real-time notifications with WebSockets

## 📄 Documentation

- [API Documentation](API_DOCUMENTATION.md) - Detailed API endpoint documentation
- [Frontend Architecture Guide](FRONTEND_ARCHITECTURE_GUIDE.md) - Frontend structure and patterns
- [Backend Architecture Guide](BACKEND_ARCHITECTURE_GUIDE.md) - Backend design and implementation
- [Database Schema](DATABASE_ARCHITECTURE_GUIDE.md) - Database design and relationships
- [Deployment Guide](DEPLOYMENT_CHECKLIST.md) - Production deployment instructions
- [CI/CD Guide](CI_CD_README.md) - Continuous integration and deployment setup

## 🙏 Acknowledgments

- **Open Source Libraries**: Thanks to all the open-source projects that make this platform possible
- **Agricultural Community**: Inspired by farmers and agricultural experts worldwide
- **Contributors**: Special thanks to all developers who have contributed to this project

## 📞 Support

- **Documentation**: Check our comprehensive guides in the `/docs` folder
- **Issues**: Report bugs and request features on GitHub Issues
- **Community**: Join our Discord server for community support
- **Email**: Contact us at support@agriconnect.com for technical support

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**AgriConnect** - Connecting the world through agriculture 🌾

Made with ❤️ by the AgriConnect team
