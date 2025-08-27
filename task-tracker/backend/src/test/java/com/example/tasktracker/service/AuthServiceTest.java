package com.example.tasktracker.service;

import com.example.tasktracker.dto.AuthResponse;
import com.example.tasktracker.dto.LoginRequest;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpServletRequest httpServletRequest;

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
        AuthResponse response = authService.authenticate(request, httpServletRequest);

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("Authentication successful", response.getMessage());
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
        AuthResponse response = authService.authenticate(request, httpServletRequest);

        // Assert
        assertFalse(response.isSuccess());
        assertNull(response.getToken());
        assertNull(response.getUsername());
        assertEquals("Invalid credentials", response.getMessage());
    }

    @Test
    public void testRegisterUser() {
        // Arrange
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("encodedPassword");

        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        AuthResponse response = authService.registerUser("testuser", "password", "test@example.com");

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("testuser", response.getUsername());
        assertEquals("User registered successfully", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class));
    }
}