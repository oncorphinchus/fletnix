# Fletnix

Fletnix is a personal media streaming application that provides a beautiful interface for browsing and watching your media collection. It consists of a PHP backend API and a Next.js frontend.

## Overview

Fletnix is designed to enhance your media streaming experience with a user-friendly interface and robust features. The application can integrate with your media server (such as Jellyfin) and provides a modern web UI for accessing your content.

## Features

- **User Authentication**: Secure login and registration
- **Media Browsing**: Browse movies and TV shows with a Netflix-like interface
- **Media Details**: View comprehensive information about each media item
- **Search**: Find media by title or other attributes
- **Watchlist**: Save media items to watch later
- **History Tracking**: Keep track of what you've watched
- **Modern UI**: Responsive design with dark mode support

## Project Structure

The project is divided into two main parts:

- **Backend**: PHP API with MySQL database
- **Frontend**: Next.js application with TypeScript and TailwindCSS

### Backend Structure

- `/api`: API endpoints
  - `/controllers`: Request handlers
  - `/models`: Database models
- `/config`: Configuration files
- `/helpers`: Utility classes

### Frontend Structure

- `/components`: Reusable UI components
- `/lib`: Utility functions and hooks
- `/pages`: Next.js pages (routes)
- `/public`: Static assets
- `/styles`: Global styles and TailwindCSS configuration

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Node.js 14 or higher
- npm or yarn
- Docker (optional)

## Getting Started

### Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fletnix.git
   cd fletnix
   ```

2. Copy the sample environment file:
   ```
   cp frontend/.env.example frontend/.env.local
   ```

3. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

### Manual Setup

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Set up a virtual host pointing to the `/backend` directory in your web server (Apache/Nginx)

3. Import the database schema:
   ```
   mysql -u username -p < config/init.sql
   ```

4. Configure your database connection in `config/database.php`

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Access the frontend at http://localhost:3000

## API Documentation

### Authentication Endpoints

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration

### Media Endpoints

- `GET /api/media`: Get all media items
- `GET /api/media/{id}`: Get a specific media item
- `GET /api/media/featured`: Get featured media
- `GET /api/media/recent`: Get recently added media

### User Endpoints

- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update user profile

### Watchlist Endpoints

- `GET /api/watchlist`: Get user's watchlist
- `POST /api/watchlist/add/{id}`: Add item to watchlist
- `POST /api/watchlist/remove/{id}`: Remove item from watchlist

### History Endpoints

- `GET /api/history`: Get user's watch history
- `POST /api/history/add`: Add item to history

## Technologies Used

### Backend
- PHP
- MySQL
- JWT for authentication

### Frontend
- Next.js
- React
- TypeScript
- TailwindCSS
- SWR for data fetching

## License

This project is proprietary.

## Contributing

This is a personal project and not open for contributions at this time. 