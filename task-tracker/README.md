# Task Tracker Application

A full-stack task management application with user authentication, built with Spring Boot, Angular, PostgreSQL, Redis, and Docker.

## Features

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
- Unified user experience across all application features

## Prerequisites

- Docker and Docker Compose
- Java 21 (for local development)
- Node.js 18+ (for frontend development)
- Maven 3.9+ (for backend development)

## Getting Started

1. Clone the repository
2. Navigate to the project directory
3. Run the application using Docker Compose:

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost/api/
- Health check: http://localhost/health

## Development

### Backend

The backend is a Spring Boot application written in Java.

To run the backend locally:
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

The frontend is an Angular application with Tailwind CSS v4 and PrimeNG v20 components.

To run the frontend locally:
```bash
cd frontend
npm install
npm start
```

## UI Frameworks

### Tailwind CSS v4
- Uses the new `@import "tailwindcss";` syntax
- Configured with `.postcssrc.json` for proper PostCSS integration
- Includes `@tailwindcss/postcss` package for Angular compatibility

### PrimeNG v20
- Latest version of the popular Angular UI component library
- Comprehensive set of accessible and responsive UI components
- Uses new theme system with `@primeuix/themes` package
- Component imports follow the new PrimeNG v20 structure

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