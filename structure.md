# Fletnix Project Structure

## Architecture Overview

Fletnix follows a client-server architecture:

1. **Backend (PHP/MySQL)**
   - RESTful API for data access
   - JWT authentication
   - Database operations
   - Integration with Jellyfin media server

2. **Frontend (Next.js)**
   - Server-side rendered React application
   - Responsive TailwindCSS UI
   - TypeScript for type safety
   - Dark mode support

3. **Infrastructure**
   - Docker containers for each service
   - Docker Compose for orchestration
   - MySQL database for persistent storage
   - Jellyfin for media streaming capabilities

## Directory Structure

```
fletnix/
├── backend/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── AuthController.php      # Handles user authentication
│   │   │   ├── MediaController.php     # Manages media content
│   │   │   ├── UserController.php      # User profile management
│   │   │   ├── HistoryController.php   # View history tracking
│   │   │   └── JellyfinController.php  # Jellyfin integration
│   │   ├── models/
│   │       ├── User.php                # User data model
│   │       ├── Media.php               # Media data model
│   │       └── History.php             # Viewing history model
│   ├── config/
│   │   ├── database.php                # Database connection
│   │   └── init.sql                    # SQL database initialization
│   └── helpers/
│       ├── ApiResponse.php             # Standardized API responses
│       └── JWTHandler.php              # JWT authentication
├── frontend/
│   ├── components/
│   │   ├── Footer.tsx                  # Site footer component
│   │   ├── Header.tsx                  # Navigation header
│   │   ├── Layout.tsx                  # Page layout wrapper
│   │   └── MediaGrid.tsx               # Grid display for media items
│   ├── lib/
│   │   └── auth.ts                     # Authentication utilities
│   ├── pages/
│   │   ├── _app.tsx                    # Next.js app configuration
│   │   ├── _document.tsx               # Custom document structure
│   │   ├── index.tsx                   # Home page
│   │   ├── login.tsx                   # Login page
│   │   ├── register.tsx                # Registration page
│   │   ├── watch/
│   │   │   └── [id].tsx                # Media details page
│   │   └── stream/
│   │       └── [id].tsx                # Media streaming page
│   ├── public/
│   │   └── robots.txt                  # Search engine instructions
│   ├── styles/
│   │   └── globals.css                 # Global styles with TailwindCSS
│   ├── types/
│   │   ├── index.d.ts                  # TypeScript declarations
│   │   ├── declarations.d.ts           # Module type declarations
│   │   └── jsx.d.ts                    # JSX type declarations
│   ├── .env.local                      # Environment variables
│   ├── Dockerfile                      # Frontend Docker configuration
│   ├── next.config.js                  # Next.js configuration
│   ├── package.json                    # npm dependencies
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # TailwindCSS configuration
│   └── tsconfig.json                   # TypeScript configuration
├── media/                              # Media files directory for Jellyfin
├── .env.example                        # Example environment variables
├── docker-compose.yml                  # Docker services configuration
├── fix-tsx-errors.sh                   # Script to fix TypeScript errors
├── run-fletnix.sh                      # Script to run Docker services
├── structure.md                        # Project structure documentation
└── README.md                           # Project documentation
```

## Component Breakdown

### Backend Components

1. **Authentication System**
   - `AuthController.php`: Handles login and registration
   - `JWTHandler.php`: Manages JWT token creation and validation
   - `User.php`: User model with password hashing/validation

2. **Media Management**
   - `MediaController.php`: CRUD operations for media items
   - `Media.php`: Media data model
   - `JellyfinController.php`: Integration with Jellyfin API

3. **User Features**
   - `UserController.php`: User profile operations
   - `HistoryController.php`: Viewing history management
   - `History.php`: History data model

4. **API Response Handling**
   - `ApiResponse.php`: Standardized response formatting

### Frontend Components

1. **Layout Components**
   - `Layout.tsx`: Page wrapper with header/footer
   - `Header.tsx`: Navigation, search, user menu
   - `Footer.tsx`: Site footer with links (using legacyBehavior for Link components)

2. **Media Display**
   - `MediaGrid.tsx`: Grid layout for media items
   - `pages/index.tsx`: Home page with featured/recent content
   - `pages/watch/[id].tsx`: Media details page
   - `pages/stream/[id].tsx`: Video player page

3. **Authentication UI**
   - `pages/login.tsx`: Login form
   - `pages/register.tsx`: Registration form
   - `lib/auth.ts`: Authentication utilities

4. **Configuration**
   - `_app.tsx`: Next.js app configuration
   - `_document.tsx`: Custom document structure
   - `tailwind.config.js`: TailwindCSS theme
   - `next.config.js`: Next.js settings

## Database Structure

The MySQL database has several key tables:

1. **users**
   - `id`: Primary key
   - `username`: Unique username
   - `email`: User email
   - `password`: Hashed password
   - `display_name`: Optional display name
   - `created_at`: Registration timestamp

2. **media**
   - `id`: Primary key
   - `title`: Media title
   - `type`: Type (movie, series, etc.)
   - `poster_path`: Path to poster image
   - `backdrop_path`: Path to backdrop image
   - `overview`: Description
   - `release_date`: Release date
   - `runtime`: Duration in minutes
   - `jellyfin_id`: ID in Jellyfin

3. **history**
   - `id`: Primary key
   - `user_id`: Foreign key to users
   - `media_id`: Foreign key to media
   - `watched_at`: Timestamp
   - `progress`: Viewing progress

4. **watchlist**
   - `id`: Primary key
   - `user_id`: Foreign key to users
   - `media_id`: Foreign key to media
   - `added_at`: Timestamp

## API Endpoints

The backend provides these endpoints:

1. **Authentication**
   - `POST /api/auth/login`: Login with username/password
   - `POST /api/auth/register`: Create a new account

2. **Media**
   - `GET /api/media`: List all media
   - `GET /api/media/{id}`: Get specific media details
   - `GET /api/media/featured`: Get featured content
   - `GET /api/media/recent`: Get recently added content
   - `GET /api/media/{id}/stream`: Get streaming URL

3. **User**
   - `GET /api/users/profile`: Get user profile
   - `PUT /api/users/profile`: Update profile

4. **Watchlist**
   - `GET /api/watchlist`: Get user's watchlist
   - `POST /api/watchlist/add/{id}`: Add to watchlist
   - `POST /api/watchlist/remove/{id}`: Remove from watchlist
   - `GET /api/watchlist/check/{id}`: Check if in watchlist

5. **History**
   - `GET /api/history`: Get viewing history
   - `POST /api/history/add`: Add to history

## Technology Stack

### Backend
- PHP for the API
- MySQL database
- JWT for authentication
- Apache web server

### Frontend
- Next.js React framework
- TypeScript for type safety
- TailwindCSS for styling
- SWR for data fetching
- React Icons for UI elements

### Infrastructure
- Docker for containerization
- Docker Compose for service orchestration
- Jellyfin integration for media server capabilities

## Development Workflow

### Running the Development Environment
```
./run-fletnix.sh
```

### Backend Development
- PHP files in the `backend/` directory
- Changes will be immediately available (volume mounting)

### Frontend Development
- Access Next.js on http://localhost:3000
- Changes will trigger hot-reloading
- Run `./fix-tsx-errors.sh` to fix TypeScript errors

### Database Changes
- Update schema in `backend/config/init.sql`
- Restart containers to apply changes

## Known Issues

1. **TypeScript Type Definitions**
   - React component type declarations need to use function declarations instead of React.FC
   - Link components need to use the legacyBehavior attribute with an <a> tag for className support
   - Please use the fix-tsx-errors.sh script to resolve common TypeScript issues

2. **Frontend Environment**
   - Environment variables configuration needs to be properly set up
   - Proper error handling for API requests

3. **Media Streaming**
   - Actual integration with Jellyfin needs to be implemented
   - Stream URLs need to be properly secured

## Future Enhancements

1. **User Experience**
   - Add more interactive elements
   - Improve mobile responsiveness
   - Implement skeleton loading states

2. **Features**
   - User ratings and reviews
   - Content recommendations
   - Advanced search with filters

3. **Performance**
   - Implement caching for API responses
   - Optimize media loading and streaming

4. **Security**
   - Add rate limiting
   - Implement CSRF protection
   - Enhance password policies

## Git Repository

The project is hosted on GitHub:
- URL: https://github.com/oncorphinchus/fletnix.git
- Main branch: main 