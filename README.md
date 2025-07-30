# Agricultural Super App API

A Flask-based API for the Agricultural Super App, providing endpoints for user management, communities, posts, expert consultations, and more.

## Features

- User authentication with JWT
- Community management
- Post creation and interaction
- Expert profiles and consultations
- Image uploads with Cloudinary
- Agricultural context for all content

## Tech Stack

- Python 3.9+
- Flask
- PostgreSQL
- SQLAlchemy
- Flask-Migrate
- JWT Authentication
- Cloudinary for image storage

## Local Development

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up environment variables in a `.env` file:
   ```
   FLASK_APP=run.py
   FLASK_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/agri_app_dev
   SECRET_KEY=your-secret-key
   JWT_SECRET_KEY=your-jwt-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
5. Initialize the database:
   ```
   flask db upgrade
   ```
6. Run the development server:
   ```
   flask run
   ```

## Deployment to Render

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

## License

[MIT License](LICENSE)