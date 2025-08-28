# Product Requirements Document (PRD)

## Goal

Implement user authentication (login/logout) functionality for the Task Tracker application with secure session management.

## Why

- Enable secure access to the Task Tracker application
- Allow users to maintain their session across application usage
- Provide a foundation for role-based access control in future features
- Protect user data and tasks from unauthorized access

## What

A complete user authentication system including login, logout, session management, and security measures. The system will integrate with the existing backend services and frontend components.

### Success Criteria

- [ ] Users can securely log in with username and password
- [ ] User sessions are properly managed with timeout
- [ ] Users can log out which terminates their session
- [ ] System prevents common authentication vulnerabilities
- [ ] Authentication integrates with existing user management

## All Needed Context

### Documentation & References

```yaml
- docfile: /mnt/c/Users/frosh/Desktop/tasktracker/QWEN.md
  why: Project development philosophy and code structure guidelines
  
- doc: https://docs.spring.io/spring-security/reference/index.html
  section: Servlet Applications
  critical: Spring Security configuration for session management

- doc: https://docs.spring.io/spring-session/reference/index.html
  section: Redis Integration
  critical: Distributed session management with Redis

- file: /mnt/c/Users/frosh/Desktop/tasktracker/backend/src/main/java/com/example/tasktracker/config/SecurityConfig.java
  why: Example of existing security configuration patterns
```

### Current Codebase tree

```bash
task-tracker/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/tasktracker/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── TaskTrackerApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── static/
│   │   │       └── templates/
│   │   └── test/java/com/example/tasktracker/
```

### Desired Codebase tree with files to be added

```bash
task-tracker/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/tasktracker/
│   │   │   │   ├── config/
│   │   │   │   │   └── SecurityConfig.java (modified)
│   │   │   │   ├── controller/
│   │   │   │   │   └── AuthController.java (new)
│   │   │   │   ├── dto/
│   │   │   │   │   ├── LoginRequest.java (new)
│   │   │   │   │   └── AuthResponse.java (new)
│   │   │   │   ├── service/
│   │   │   │   │   └── AuthService.java (new)
```

### Known Gotchas of our codebase & Library Quirks

```java
// CRITICAL: Spring Security requires proper configuration of authentication providers
// CRITICAL: Password encoding must use BCryptPasswordEncoder
// CRITICAL: Session management should use Redis for distributed applications
// CRITICAL: CSRF protection must be properly configured for REST APIs
// CRITICAL: Follow single responsibility principle - separate auth logic from other services
```

## Implementation Blueprint

### Data models and structure

```java
// Login request DTO
public class LoginRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    // getters/setters
}

// Authentication response DTO
public class AuthResponse {
    private String token;
    private String username;
    private boolean success;
    private String message;
    // getters/setters
}

// User entity (existing)
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
  
    @Column(unique = true)
    @NotBlank
    private String username;
  
    @NotBlank
    private String password; // Encrypted with BCrypt
  
    // Other existing fields...
    // getters/setters
}
```

### List of tasks to be completed

```yaml
Task 1:
MODIFY backend/src/main/java/com/example/tasktracker/config/SecurityConfig.java:
  - CONFIGURE form login and logout endpoints
  - SET up session management with Redis
  - ENABLE CSRF protection for REST
  - CONFIGURE password encoder (BCrypt)

Task 2:
CREATE backend/src/main/java/com/example/tasktracker/dto/LoginRequest.java:
  - IMPLEMENT validation annotations
  - ADD proper getters/setters

CREATE backend/src/main/java/com/example/tasktracker/dto/AuthResponse.java:
  - DEFINE response structure
  - INCLUDE success indicator and messages

Task 3:
CREATE backend/src/main/java/com/example/tasktracker/service/AuthService.java:
  - IMPLEMENT authentication logic
  - HANDLE password validation
  - GENERATE session tokens

Task 4:
CREATE backend/src/main/java/com/example/tasktracker/controller/AuthController.java:
  - IMPLEMENT login endpoint
  - IMPLEMENT logout endpoint
  - HANDLE authentication exceptions
  - RETURN proper HTTP status codes

Task 5:
UPDATE backend/src/main/resources/application.yml:
  - CONFIGURE session properties
  - SET Redis connection details
```

### Per task pseudocode

```java
// Task 1 - SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableRedisHttpSession
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/login", "/api/auth/logout").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form.disable()) // We'll implement custom login
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler(customLogoutSuccessHandler())
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .sessionRegistry(sessionRegistry())
            );
        return http.build();
    }
  
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

// Task 2 - LoginRequest.java
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;
  
    @NotBlank(message = "Password is required")
    private String password;
    // getters/setters
}

// Task 2 - AuthResponse.java
public class AuthResponse {
    private boolean success;
    private String message;
    private String token; // Session token
    private String username;
    // getters/setters
}

// Task 3 - AuthService.java
@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
  
    @Autowired
    private UserRepository userRepository;
  
    public AuthResponse authenticate(LoginRequest loginRequest) {
        try {
            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
          
            // Generate session token
            String token = UUID.randomUUID().toString();
          
            return new AuthResponse(true, "Authentication successful", token, loginRequest.getUsername());
        } catch (BadCredentialsException e) {
            return new AuthResponse(false, "Invalid credentials", null, null);
        }
    }
}

// Task 4 - AuthController.java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
  
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticate(loginRequest);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
  
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        // Invalidate session
        request.getSession().invalidate();
        return ResponseEntity.ok(new AuthResponse(true, "Logout successful", null, null));
    }
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "Ensure users table exists with username and password fields"
  - index: "CREATE INDEX idx_username ON users(username)"
  
CONFIG:
  - add to: backend/src/main/resources/application.yml
  - pattern: |
      spring:
        session:
          store-type: redis
        redis:
          host: localhost
          port: 6379
  
ROUTES:
  - add to: backend/src/main/java/com/example/tasktracker/controller/AuthController.java
  - pattern: |
      POST /api/auth/login - Authenticate user
      POST /api/auth/logout - Terminate user session
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
cd backend
./mvnw compile
# Expected: No compilation errors
```

### Level 2: Unit Tests

```java
// CREATE backend/src/test/java/com/example/tasktracker/service/AuthServiceTest.java
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
  
    @Mock
    private AuthenticationManager authenticationManager;
  
    @Mock
    private UserRepository userRepository;
  
    @InjectMocks
    private AuthService authService;
  
    @Test
    public void testSuccessfulAuthentication() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");
      
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(auth);
      
        // Act
        AuthResponse response = authService.authenticate(request);
      
        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertEquals("testuser", response.getUsername());
    }
  
    @Test
    public void testFailedAuthentication() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrongpassword");
      
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("Invalid credentials"));
      
        // Act
        AuthResponse response = authService.authenticate(request);
      
        // Assert
        assertFalse(response.isSuccess());
        assertNull(response.getToken());
        assertEquals("Invalid credentials", response.getMessage());
    }
}

// CREATE backend/src/test/java/com/example/tasktracker/controller/AuthControllerTest.java
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
public class AuthControllerTest {
  
    @Autowired
    private TestRestTemplate restTemplate;
  
    @Test
    public void testLoginEndpoint() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");
      
        // Act
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/login", request, AuthResponse.class);
      
        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(Objects.requireNonNull(response.getBody()).isSuccess());
    }
  
    @Test
    public void testLogoutEndpoint() {
        // Arrange - First login to get a session
        // ... login code ...
      
        // Act
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/logout", null, AuthResponse.class);
      
        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(Objects.requireNonNull(response.getBody()).isSuccess());
    }
}
```

```bash
# Run and iterate until passing:
cd backend
./mvnw test -Dtest=AuthServiceTest,AuthControllerTest
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test

```bash
# Start the services
cd backend
./mvnw spring-boot:run

# Test the login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password"}'

# Expected: {"success": true, "token": "...", "username": "testuser", "message": "Authentication successful"}

# Test the logout endpoint
curl -X POST http://localhost:8080/api/auth/logout

# Expected: {"success": true, "message": "Logout successful"}
```

## Final validation Checklist

- [X] All tests pass: `./mvnw test`
- [X] No compilation errors: `./mvnw compile`
- [X] Manual API tests successful with curl
- [ ] Session management works correctly with Redis
- [X] Security measures properly implemented
- [ ] Error cases handled gracefully
- [X] Documentation updated if needed
