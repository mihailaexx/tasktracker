package com.example.tasktracker.controller;

import com.example.tasktracker.base.BaseIntegrationTest;
import com.example.tasktracker.config.TestConfig;
import com.example.tasktracker.dto.LoginRequest;
import com.example.tasktracker.dto.RegisterRequest;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("AuthController Integration Tests")
@Transactional
class AuthControllerTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUpTestData() {
        // Clean existing users
        userRepository.deleteAll();
        
        // Create a test user
        testUser = new User();
        testUser.setUsername("mihailaexuser1");
        testUser.setEmail("mihailaexuser1@gmail.com");
        testUser.setPassword(passwordEncoder.encode("pRH8F8cu@FYhRqG"));
        testUser = userRepository.save(testUser);
    }

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Should register new user successfully")
        void shouldRegisterNewUserSuccessfully() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("mihailaexuser_new");
            registerRequest.setEmail("mihailaexuser_new@gmail.com");
            registerRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("successfully")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser_new")));

            // Verify user was created in database
            assertTrue(userRepository.findByUsername("mihailaexuser_new").isPresent());
        }

        @Test
        @DisplayName("Should fail registration with duplicate username")
        void shouldFailRegistrationWithDuplicateUsername() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("mihailaexuser1"); // Duplicate username
            registerRequest.setEmail("different@gmail.com");
            registerRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("already exists")));
        }

        @Test
        @DisplayName("Should fail registration with duplicate email")
        void shouldFailRegistrationWithDuplicateEmail() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("differentuser");
            registerRequest.setEmail("mihailaexuser1@gmail.com"); // Duplicate email
            registerRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("already exists")));
        }

        @Test
        @DisplayName("Should fail registration with invalid username - too short")
        void shouldFailRegistrationWithShortUsername() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("ab"); // Too short
            registerRequest.setEmail("test@gmail.com");
            registerRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail registration with invalid password - too short")
        void shouldFailRegistrationWithShortPassword() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("validuser");
            registerRequest.setEmail("test@gmail.com");
            registerRequest.setPassword("abc"); // Too short

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail registration with invalid email format")
        void shouldFailRegistrationWithInvalidEmail() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("validuser");
            registerRequest.setEmail("invalid-email");
            registerRequest.setPassword("password123");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail registration with empty fields")
        void shouldFailRegistrationWithEmptyFields() throws Exception {
            RegisterRequest registerRequest = new RegisterRequest();
            registerRequest.setUsername("");
            registerRequest.setEmail("");
            registerRequest.setPassword("");

            mockMvc.perform(post("/api/auth/register")
                    .contentType(JSON)
                    .content(toJson(registerRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Should login successfully with valid credentials")
        void shouldLoginSuccessfully() throws Exception {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername("mihailaexuser1");
            loginRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(JSON)
                    .content(toJson(loginRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("successful")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser1")));
        }

        @Test
        @DisplayName("Should fail login with invalid username")
        void shouldFailLoginWithInvalidUsername() throws Exception {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername("mihailaexuser_nonexistent");  // Non-existent username
            loginRequest.setPassword("pRH8F8cu@FYhRqG");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(JSON)
                    .content(toJson(loginRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("Invalid")));
        }

        @Test
        @DisplayName("Should fail login with invalid password")
        void shouldFailLoginWithInvalidPassword() throws Exception {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername("mihailaexuser_new");
            loginRequest.setPassword("wrongpassword");  // Incorrect password

            mockMvc.perform(post("/api/auth/login")
                    .contentType(JSON)
                    .content(toJson(loginRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("Invalid")));
        }

        @Test
        @DisplayName("Should fail login with empty credentials")
        void shouldFailLoginWithEmptyCredentials() throws Exception {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setUsername("");
            loginRequest.setPassword("");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(JSON)
                    .content(toJson(loginRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/logout")
    class LogoutTests {

        @Test
        @DisplayName("Should logout successfully when authenticated")
        void shouldLogoutSuccessfully() throws Exception {
            mockMvc.perform(post("/api/auth/logout")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("Logout successful")));
        }

        @Test
        @DisplayName("Should logout successfully even when not authenticated")
        void shouldLogoutSuccessfullyWhenNotAuthenticated() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("Logout successful")));
        }
    }

    @Nested
    @DisplayName("GET /api/auth/me")
    class CurrentUserTests {

        @Test
        @DisplayName("Should return current user when authenticated")
        void shouldReturnCurrentUserWhenAuthenticated() throws Exception {
            mockMvc.perform(get("/api/auth/me")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("authenticated")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser")));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/auth/me"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }
}