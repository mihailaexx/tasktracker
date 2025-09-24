package com.example.tasktracker.controller;

import com.example.tasktracker.dto.AuthResponse;
import com.example.tasktracker.dto.LoginRequest;
import com.example.tasktracker.dto.RegisterRequest;
import com.example.tasktracker.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ResponseStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        logger.info("Login attempt for user: {}", loginRequest.getUsername());
        AuthResponse response = authService.authenticate(loginRequest, request);

        if (response.isSuccess()) {
            logger.info("Successful login for user: {}", loginRequest.getUsername());
        } else {
            logger.warn("Failed login attempt for user: {}", loginRequest.getUsername());
        }
        return response;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Registration attempt for user: {}", registerRequest.getUsername());

        AuthResponse response = authService.registerUser(
            registerRequest.getUsername(),
            registerRequest.getPassword(),
            registerRequest.getEmail()
        );

        if (response.isSuccess()) {
            logger.info("Successful registration for user: {}", registerRequest.getUsername());
        } else {
            logger.warn("Failed registration attempt for user: {}", registerRequest.getUsername());
        }
        return response;
    }

    @PostMapping("/logout")
    public AuthResponse logout(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null) {
            logger.info("Logout for user: {}", auth.getName());
            new SecurityContextLogoutHandler().logout(request, response, auth);
            SecurityContextHolder.clearContext();
        }

        return new AuthResponse(true, "Logout successful", null, null);
    }

    @GetMapping("/me")
    public AuthResponse getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return new AuthResponse(true, "User authenticated", null, auth.getName());
        } else {
            throw new RuntimeException("User not authenticated");
        }
    }
}