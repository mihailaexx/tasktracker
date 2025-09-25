package com.example.tasktracker.service;

import com.example.tasktracker.dto.AuthResponse;
import com.example.tasktracker.dto.LoginRequest;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * User authentication
     */
    public AuthResponse authenticate(LoginRequest loginRequest, HttpServletRequest request) {
        try {
            // Создание токена аутентификации
            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                );

            // Аутентификация пользователя
            Authentication authentication = authenticationManager.authenticate(authToken);

            // Создание security context
            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);

            // Сохранение контекста в сессии
            HttpSession session = request.getSession(true);
            session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, 
                securityContext
            );

            return new AuthResponse(
                true, 
                "Authentication successful", 
                session.getId(), 
                authentication.getName()
            );
            
        } catch (BadCredentialsException e) {
            return new AuthResponse(false, "Invalid username or password", null, null);
        } catch (AuthenticationException e) {
            return new AuthResponse(false, "Authentication failed", null, null);
        } catch (Exception e) {
            return new AuthResponse(false, "Internal server error", null, null);
        }
    }

    /**
     * User registration
     */
    public AuthResponse registerUser(String username, String password, String email) {
        try {
            // Валидация пароля
            if (password.length() < 8) {
                return new AuthResponse(false, "Password must be at least 8 characters long", null, null);
            }

            // Создание нового пользователя
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);

            userRepository.save(user);

            return new AuthResponse(true, "User registered successfully", null, username);
            
        } catch (DataIntegrityViolationException e) {
            // Handle unique constraint violations (username or email already exists)
            String errorMessage = e.getMessage().toLowerCase();
            if (errorMessage.contains("username")) {
                return new AuthResponse(false, "Username already exists", null, null);
            } else if (errorMessage.contains("email")) {
                return new AuthResponse(false, "Email already exists", null, null);
            } else {
                return new AuthResponse(false, "User with these credentials already exists", null, null);
            }
        } catch (Exception e) {
            return new AuthResponse(false, "Registration failed" + e.getMessage(), null, null);
        }
    }
}