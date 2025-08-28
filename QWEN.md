# QWEN.md

This file provides comprehensive guidance to Qwen Code when working with code in this repository.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

* **Dependency Inversion** : High-level modules should not depend on low-level modules. Both should depend on abstractions.
* **Open/Closed Principle** : Software entities should be open for extension but closed for modification.
* **Single Responsibility** : Each function, class, and module should have one clear purpose.
* **Fail Fast** : Check for potential errors early and raise exceptions immediately when issues occur.

## Code Structure & Modularity

### File and Function Limits

* **Never create a file longer than 500 lines of code** . If approaching this limit, refactor by splitting into modules.
* **Functions should be under 50 lines** with a single, clear responsibility.
* **Classes should be under 100 lines** and represent a single concept or entity.
* **Organize code into clearly separated modules** , grouped by feature or responsibility.
* **Important for Angular** - separate templates and components. Never write full HTML in @Components

### Project Architecture

```
task-tracker/
├── backend/           
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/tasktracker/
│   │   │   │   ├── config/        # Spring config (Security, Redis, DB)
│   │   │   │   ├── controller/    # REST-controllers
│   │   │   │   ├── dto/           # DTO-classes (request/response)
│   │   │   │   ├── entity/        # JPA-entities
│   │   │   │   ├── exception/     # Custom exceptions
│   │   │   │   ├── repository/    # Spring Data JPA interfaces
│   │   │   │   ├── service/       # Business logic
│   │   │   │   └── TaskTrackerApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml   # Spring Boot config
│   │   │       ├── static/           # Static resources
│   │   │       └── templates/        # (Thymeleaf optional)
│   │   └── test/java/com/example/tasktracker/
│   │       └── ...                   # Unit and Integration test
│   ├── pom.xml                       # Maven config
│   └── Dockerfile                    # Docker
│
├── frontend/          
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Services, interceptors, guards
│   │   │   ├── features/          # (e.g: tasks, users, projects)
│   │   │   ├── shared/            # Components etc.
│   │   │   └── app.component.ts
│   │   ├── assets/                # Static content
│   │   ├── environments/          # Env configs (dev, prod)
│   │   └── index.html
│   ├── angular.json               # Angular CLI config
│   ├── package.json
│   └── Dockerfile                 # Docker
│
├── nginx/
│   ├── nginx.conf                  # Reverse proxy config
│   └── Dockerfile                  # Docker
│
├── docker-compose.yml  
├── README.md
└── .gitignore
```

### Development Environment

### Prerequisites

* Java 21 JDK (as specified in the project)
* Node.js 18.20.0+ (with npm 9+)
* Docker and Docker Compose
* Maven 3.9.11+
* Git

### IDE/Editor Recommendations

* **Backend (Java/Spring)**: IntelliJ IDEA Ultimate
* **Frontend (Angular)**: IntelliJ IDEA Ultimate
* **Infrastructure**: Any text editor with YAML/JSON support

### Environment Setup

1. Install Java 21 JDK (as specified in the project)
2. Install Node.js 18+ and npm 9+
3. Install Docker and Docker Compose
4. Install Maven 3.9+
5. Clone the repository
6. Run `npm install` in the frontend directory
7. For backend, import as Maven project in your IDE

### Running the Application Locally

* **Backend**:
  ```bash
  cd backend
  mvn spring-boot:run
  ```
* **Frontend**:
  ```bash
  cd frontend
  npm start
  ```
* **Full Stack with Docker**:
  ```bash
  docker-compose up --build
  ```

### Debugging

* Backend services run on port 8080 by default
* Frontend runs on port 4200 by default
* Use your IDE's debugger for breakpoints and step-through debugging
* Logs are available in console output when running services

## Style & Conventions

### Backend (Java/Spring)

* Follow Google Java Style Guide
* Use Lombok annotations to reduce boilerplate (`@Data`, `@AllArgsConstructor`, etc.)
* Controller methods should be thin - delegate to services
* Services should contain business logic
* Repositories should only handle data access
* Use `@Transactional` annotations appropriately
* Validate input with Bean Validation annotations
* Use meaningful variable and method names
* Write JavaDoc for all public methods and classes

### Frontend (Angular/TypeScript)

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

#### UI Libraries

The project uses Tailwind CSS for utility-first styling and PrimeNG for rich UI components. These libraries provide a consistent design system and reduce development time.

- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces
- **PrimeNG**: A collection of rich UI components for Angular

#### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

#### Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

#### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Use Tailwind CSS classes for styling instead of `ngClass`
- Use PrimeNG components for complex UI elements (data tables, forms, etc.)
- Follow a consistent component structure with clear separation of concerns

#### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

#### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Use PrimeNG components for advanced UI elements
- Apply Tailwind CSS utility classes for styling
- Follow accessibility best practices (ARIA attributes, semantic HTML)

#### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

#### UI/UX Design Guidelines

- Follow modern design principles with consistent spacing, typography, and color schemes
- Use PrimeNG's built-in themes and components for a professional look and feel
- Implement responsive design using Tailwind's responsive utilities
- Ensure proper contrast ratios and accessibility compliance
- Use consistent iconography from PrimeNG's icon library
- Implement proper loading states and error handling with user-friendly messages

### General Code Conventions

* Use meaningful variable and function names
* Write self-documenting code
* Avoid magic numbers and strings
* Keep functions small and focused
* Limit nesting to 3 levels maximum
* Use constants for configuration values
* Comment complex logic with clear explanations
* Remove dead or commented-out code

## Testing Strategy

* Unit tests: run in containers (Maven/Node) or on host; both work.
* Integration tests: use Testcontainers in the backend to spin ephemeral Postgres/Redis per test suite; this mirrors your Docker runtime and avoids dev DB coupling.
* Wire integration tests into CI (see below).

### CI integration (quick sketch)

* Build images for both apps with the same Dockerfiles (use prod targets).
* Cache Maven (~/.m2) and Node (~/.npm) between jobs to speed up.
* Jobs:
  1. Lint & unit tests (frontend/backend).
  2. Integration tests (backend with Testcontainers).
  3. Build & push Docker images (tag with commit SHA).
  4. Deploy (compose or Kubernetes), using prod env/secret store.

## Error Handling and Logging

### Error Handling Principles

* **Fail Fast**: Validate inputs early and throw exceptions immediately when preconditions are not met
* **Don't Ignore Exceptions**: Always handle exceptions appropriately - never use empty catch blocks
* **Use Specific Exceptions**: Throw the most specific exception type possible
* **Provide Useful Error Messages**: Include context and actionable information in error messages
* **Log and Move On**: Log exceptions but don't let them break the entire application flow when possible

### Backend Error Handling

* Use Spring's `@ControllerAdvice` for global exception handling
* Create custom exception classes for specific business logic errors
* Return appropriate HTTP status codes (4xx for client errors, 5xx for server errors)
* Don't expose sensitive information in error responses
* Validate input at the controller level using `@Valid`

### Frontend Error Handling

* Handle HTTP errors gracefully with user-friendly messages
* Use Angular's ErrorHandler for global error handling
* Implement retry mechanisms for transient failures
* Display loading states during async operations
* Log errors to console in development mode

### Logging Standards

* Use appropriate log levels:
  * **ERROR**: For critical errors that require immediate attention
  * **WARN**: For potentially problematic situations
  * **INFO**: For important business logic events
  * **DEBUG**: For detailed information useful for diagnosing issues
* Include contextual information in log messages
* Never log sensitive information (passwords, tokens, etc.)
* Use structured logging when possible
* Log method entry/exit points for complex operations

## Documentation Standards

### Code Documentation

* Every module should have a docstring explaining its purpose
* Public functions must have complete docstrings
* Complex logic should have inline comments with `# Reason:` prefix
* Keep README.md updated with setup instructions and examples
* Maintain CHANGELOG.md for version history

## Security Best Practices

### Security Guidelines

* Never commit secrets - use environment variables
* Validate all user input
* Use parameterized queries for database operations
* Implement rate limiting for APIs
* Implement proper authentication and authorization

## UI/UX Design Patterns

The application follows modern UI/UX design patterns to ensure a consistent and professional user experience:

### Layout and Structure
- Use of consistent spacing with Tailwind's spacing scale (p-4, m-6, gap-4, etc.)
- Responsive grid layouts that adapt to different screen sizes
- Clear visual hierarchy with appropriate typography and contrast
- Consistent navigation patterns using PrimeNG's Menubar component

### Component Design
- Use of PrimeNG's extensive component library for common UI elements
- Consistent button styles and interactions
- Proper use of color to indicate state (success, warning, error, info)
- Appropriate use of icons from PrimeNG's icon library
- Meaningful feedback through PrimeNG's Toast and Confirmation components

### Interaction Patterns
- Smooth transitions and animations using Tailwind's transition utilities
- Clear hover and focus states for interactive elements
- Progressive disclosure of information through accordions, dialogs, and expandable sections
- Confirmation flows for destructive actions
- Loading states for asynchronous operations

### Accessibility
- Proper semantic HTML structure
- Sufficient color contrast ratios
- Keyboard navigation support
- ARIA attributes where appropriate
- Screen reader compatibility

### Consistent Design Across Components
All components follow a unified design language:
- Card-based layout with subtle shadows for depth
- Consistent color palette using Tailwind's built-in colors
- Unified form styling with PrimeNG input components
- Standardized button patterns using PrimeNG buttons
- Responsive design that works on all device sizes
- Consistent error handling and user feedback through Toast messages

### PrimeNG v20 Best Practices
- Use PrimeNG components directly from `primeng/[component-name]` without specific module imports
- Leverage the new theme system with `@primeuix/themes` for consistent styling
- Use standardized severity values: `success`, `info`, `warn`, `danger`, `secondary`, `contrast`
- Follow component naming conventions:
  - `p-dropdown` → `p-select`
  - `p-calendar` → `p-datepicker`
  - `p-inputtextarea` → `p-textarea`
- Use PrimeNG's built-in responsive features for mobile-friendly designs
- Implement proper form validation with PrimeNG's validation components
- Utilize PrimeNG's accessibility features for inclusive design

## Useful Resources

Essential Tools

* Java 21 - https://docs.oracle.com/en/java/javase/21/
* Angular 20.0.0 - https://angular.dev/overview
* Tailwind CSS 4.1 - https://tailwindcss.com/docs/
* PrimeNG 20.0.0 - https://primeng.org/
* Spring Boot 3.5.3 - https://docs.spring.io/spring-boot/reference/index.html (Web, Lombok, Data JPA, Security, Validation, Actuator, Docker Compose support, Session for redis, PostgreSQL driver)
* PostgreSQL 17.6 - https://www.postgresql.org/docs/
* Redis 8-alpine - https://redis.io/docs/latest/
* Maven 3.9.11 - https://maven.apache.org/guides/index.html
* Node.js 18.20.0 + Angular CLI - https://nodejs.org/docs/latest/api/
* Docker + Docker Compose - https://docs.docker.com/ and https://docs.docker.com/compose/
* Nginx 1.29.1 (as reverse proxy) - https://nginx.org/en/docs/

## Important Notes

* **NEVER BUILD COMPONENTS ON LOCAL MACHINE** - use only containers and setup it to clean dependency installation
* **NEVER CREATE ANY SCRIPTS**
* **NEVER ASSUME OR GUESS** - When in doubt, ask for clarification
* **NEVER DOWNGRADE VERSIONS OF ANY TOOL** - if you don't know how to use this version, use context7 and find lastest available documentation
* **ALWAYS CHECK FOR NEW VERSION AVAILABLE, and if so, update lo latest version and all dependencies**
* **Always verify file paths and module names** before use
* **Keep CLAUDE.md updated** when adding new patterns or dependencies
* **Test your code** - No feature is complete without tests
* **Document your decisions** - Future developers (including yourself) will thank you
