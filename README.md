# Task Tracker Monorepo

A full-stack task management application with user authentication, built with Spring Boot, Angular, PostgreSQL, Redis, and Docker.

## Project Structure

```
tasktracker/
├── README.md                 # This file
├── QWEN.md                   # Development guidelines
├── task-tracker/             # Main application
│   ├── backend/             # Spring Boot application
│   ├── frontend/             # Angular application
│   ├── docker-compose.yml    # Docker Compose configuration
│   └── README.md             # Application documentation
└── samples/                  # Sample implementations
```

## Technology Stack

- **Backend**: Spring Boot 3.5.3 with Java 21
- **Frontend**: Angular 20.0.0 with Node.js 18.20.0
- **UI Libraries**: Tailwind CSS v4 and PrimeNG v20
- **Database**: PostgreSQL 17.6
- **Cache**: Redis 8-alpine
- **Web Server**: Nginx 1.29.1
- **Containerization**: Docker and Docker Compose

## Task Tracker Application

The main application is located in the `task-tracker/` directory. It includes:

### Features

- User authentication (login/logout) with secure session management
- Task management (create, read, update, delete)
- User profile management
- Role-based access control
- RESTful API
- Containerized deployment with Docker
- PostgreSQL for data persistence
- Redis for session management
- Modern UI with Tailwind CSS v4 and PrimeNG v20 components
- Responsive design for all device sizes
- Professional UI components and consistent design language

For detailed information about the application, see [task-tracker/README.md](task-tracker/README.md).

## Development Guidelines

This repository follows specific development guidelines documented in [QWEN.md](QWEN.md). These guidelines cover:

- Core development philosophy (KISS, YAGNI)
- Code structure and modularity
- Style and conventions
- Testing strategy
- Error handling and logging
- Security best practices

## Quick Start

1. Clone the repository
2. Navigate to the task-tracker directory:
   ```bash
   cd task-tracker
   ```
3. Run the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

The application will be available at:

- Frontend: http://localhost
- Backend API: http://localhost/api/
- Health check: http://localhost/health

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Health

- `GET /health` - Health check

## Frontend Development

The frontend uses Angular with Tailwind CSS v4 and PrimeNG v20 components.

### Prerequisites

- Node.js 18+ (for frontend development)

### UI Frameworks

#### Tailwind CSS v4

- Uses the new `@import "tailwindcss";` syntax
- Configured with `.postcssrc.json` for proper PostCSS integration
- Includes `@tailwindcss/postcss` package for Angular compatibility

#### PrimeNG v20

- Latest version of the popular Angular UI component library
- Comprehensive set of accessible and responsive UI components
- Uses new theme system with `@primeuix/themes` package
- Component imports follow the new PrimeNG v20 structure

### Development Setup

To run the frontend locally:

```bash
cd task-tracker/frontend
npm install
npm start
```

## Backend Development

### Prerequisites

- Java 21 (for local development)
- Maven 3.9+ (for backend development)

The backend uses Spring Boot with Java 21.

To run the backend locally:

```bash
cd task-tracker/backend
./mvnw spring-boot:run
```

## Testing

### Backend

Run unit tests:

```bash
cd backend
./mvnw test
```

Run integration tests:

```bash
cd backend
./mvnw verify
```

### Frontend

Run unit tests:

```bash
cd frontend
npm test
```

## Deployment

The application is containerized using Docker and can be deployed using Docker Compose.

To deploy in production mode:

```bash
docker-compose -f docker-compose.yml up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
