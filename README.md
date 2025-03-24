# Fletnix Media Streaming Platform

Fletnix is a personal media streaming application with a PHP backend API and a Next.js frontend.

## Quick Start with Docker

The easiest way to run Fletnix is using Docker:

```bash
# Clone this repository
git clone https://github.com/oncorphinchus/fletnix.git
cd fletnix

# Run the application
./run-fletnix.sh
```

After running, access the following services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Jellyfin: http://localhost:8096

Default login credentials:
- Username: admin
- Password: admin123

## Manual Setup

If you prefer to set up the services manually:

### Backend Setup

```bash
cd backend
# Set up environment variables
cp ../.env.example .env
# Install dependencies if using Composer
# composer install
```

### Frontend Setup

```bash
cd frontend
# Install dependencies
npm install
# Set up environment variables
cp ../.env.example .env.local
# Run development server
npm run dev
```

### Database Setup

The database schema is automatically initialized when you run Docker. If setting up manually, use the `backend/config/init.sql` file.

## Development

### Frontend Development

The frontend is built with Next.js and TypeScript. To start development:

```bash
cd frontend
npm run dev
```

### Backend Development

The backend is a PHP API. Files in the `backend` directory are mounted into the Docker container, so changes will be immediately available.

## Project Structure

See the detailed project structure in [structure.md](structure.md).

## API Documentation

The backend provides the following endpoints:

### Authentication
- `POST /api/auth/login`: Login with username/password
- `POST /api/auth/register`: Create a new account

### Media
- `GET /api/media`: List all media
- `GET /api/media/{id}`: Get specific media details
- `GET /api/media/featured`: Get featured content
- `GET /api/media/{id}/stream`: Get streaming URL

### User
- `GET /api/users/profile`: Get user profile
- `PUT /api/users/profile`: Update profile

### Watchlist and History
- `GET /api/watchlist`: Get user's watchlist
- `POST /api/watchlist/add/{id}`: Add to watchlist
- `GET /api/history`: Get viewing history
- `POST /api/history/add`: Add to history

## Technologies Used

- **Backend**: PHP, MySQL, JWT authentication
- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Infrastructure**: Docker, Docker Compose

## License

This project is proprietary and not intended for redistribution. 