# Task Tracker - Technology Stack Update Log

This document logs the updates made to the Task Tracker application to use the latest stable versions of all technologies.

## Updates Made

### Backend (Spring Boot)
- Updated Maven base image in Dockerfile from 3.9.4 to 3.9.11
- Updated Spring Boot version from 3.3.11 to 3.5.3

### Frontend (Angular)
- Updated Node.js base image in Dockerfiles from 18 to 18.20.0
- Updated Nginx base image in production Dockerfile from alpine to 1.29.1-alpine
- Updated Nginx base image in nginx Dockerfile from alpine to 1.29.1-alpine
- Updated proxy configuration target to use localhost instead of hardcoded IP
- Updated Angular framework from version 18.2.13 to 20.0.0
- Updated related dependencies:
  - @angular-devkit/build-angular: ^18.2.13 → ^20.0.0
  - @angular/cli: ~18.2.13 → ~20.0.0
  - @angular/compiler-cli: ^18.2.13 → ^20.0.0
  - typescript: ~5.4.0 → ~5.8.0

### Documentation
- Updated README.md to include current technology stack information
- Updated QWEN.md to reflect current versions of all technologies
- Updated prerequisites to specify exact versions needed

## Files Modified

1. `/task-tracker/backend/Dockerfile` - Updated Maven version
2. `/task-tracker/frontend/Dockerfile` - Updated Node.js version
3. `/task-tracker/frontend/Dockerfile.prod` - Updated Node.js and Nginx versions
4. `/task-tracker/nginx/Dockerfile` - Updated Nginx version
5. `/task-tracker/frontend/proxy.conf.json` - Updated proxy target
6. `/task-tracker/frontend/package.json` - Updated Angular dependencies to v20 and TypeScript to v5.8
7. `/task-tracker/backend/pom.xml` - Updated Spring Boot version to 3.5.3
8. `/README.md` - Updated with current technology stack information
9. `/QWEN.md` - Updated with current versions in prerequisites and resources section

## Benefits of These Updates

1. **Security**: Newer versions include the latest security patches
2. **Performance**: Performance improvements in newer versions
3. **Features**: Access to new features and improvements in Angular v20 and Spring Boot 3.5.3
4. **Compatibility**: Better compatibility with modern development tools
5. **Support**: Continued support and updates from the community

## Testing Recommendations

1. Run all existing unit tests
2. Run integration tests
3. Perform manual testing of all application features
4. Check for any console errors in the browser
5. Verify database operations work correctly
6. Test session management with Redis
7. Verify Angular v20 features work as expected
8. Verify Spring Boot 3.5.3 features work as expected