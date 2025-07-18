# Agricultural Super App

A platform that revolutionizes the agricultural sector through centralization of information and networking of different agricultural experts.

## 📋 Project Overview

The Agricultural Super App addresses key challenges in the agricultural sector:
- Limited access to agricultural information and knowledge
- Fragmented supply chain and market inefficiencies
- Limited access to finance and insurance
- Low adoption of technology and digital tools
- Data privacy and security concerns

## 🚀 Features

- User account management (create, login, profile)
- Agricultural blog/post system with images
- Community/group system for farmers and experts
- Expert following system
- Direct messaging between users
- Comment and like system for posts
- Mobile-friendly responsive design

## 🛠️ Tech Stack

- **Frontend**: React + Redux Toolkit
- **Backend**: Python Flask
- **Database**: PostgreSQL
- **Testing**: Jest (Frontend), Pytest (Backend)
- **CI/CD**: GitHub Actions

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL (v13+)

### Backend Setup

1. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up PostgreSQL database**:
   ```bash
   # Create development and test databases
   createdb agri_app_dev
   createdb agri_app_test
   ```

4. **Set up environment variables**:
   ```bash
   # The .env file contains configuration for:
   # - Database connection
   # - Secret keys
   # - Upload folder
   # - CORS settings
   # - Pagination defaults
   ```

5. **Initialize the database**:
   ```bash
   # Initialize migrations and create tables
   python init_db.py
   
   # Seed the database with initial data (optional)
   python seed.py
   ```

6. **Start the Flask server**:
   ```bash
   python run.py
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Backend Tests
```bash
pytest
```

### Frontend Tests
```bash
cd client
npm test
```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running.

## 🌐 Deployment

The application is deployed using GitHub Actions CI/CD pipeline:
- Push to `develop` branch deploys to staging
- Push to `main` branch deploys to production

## 👥 Team

- Godwin
- Silver
- felix
- lynn

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.