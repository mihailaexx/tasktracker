package com.example.tasktracker.controller;

import com.example.tasktracker.base.BaseIntegrationTest;
import com.example.tasktracker.config.TestConfig;
import com.example.tasktracker.dto.ProfileRequest;
import com.example.tasktracker.entity.Profile;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.ProfileRepository;
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

@DisplayName("ProfileController Integration Tests")
@Transactional
class ProfileControllerTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Profile testProfile;

    @BeforeEach
    void setUpTestData() {
        // Clean existing data
        profileRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create a test user
        testUser = new User();
        testUser.setUsername("mihailaexuser2");
        testUser.setEmail("mihailaexuser2@gmail.com");
        testUser.setPassword(passwordEncoder.encode("pRH8F8cu@FYhRqG"));
        testUser = userRepository.save(testUser);

        // Create a test profile
        testProfile = new Profile();
        testProfile.setFirstName("Test");
        testProfile.setLastName("User");
        testProfile.setEmail("mihailaexuser2@gmail.com");
        testProfile.setUser(testUser);
        testProfile = profileRepository.save(testProfile);
    }

    @Nested
    @DisplayName("GET /api/profile")
    class GetProfileTests {

        @Test
        @DisplayName("Should return user profile when authenticated")
        void shouldReturnUserProfileWhenAuthenticated() throws Exception {
            mockMvc.perform(get("/api/profile")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.firstName", is("Test")))
                    .andExpect(jsonPath("$.lastName", is("User")))
                    .andExpect(jsonPath("$.email", is("mihailaexuser2@gmail.com")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser2")));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/profile"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return profile even if profile fields are null")
        void shouldReturnProfileEvenIfFieldsAreNull() throws Exception {
            // Update profile to have null fields
            testProfile.setFirstName(null);
            testProfile.setLastName(null);
            profileRepository.save(testProfile);

            mockMvc.perform(get("/api/profile")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.firstName").doesNotExist())
                    .andExpect(jsonPath("$.lastName").doesNotExist())
                    .andExpect(jsonPath("$.email", is("mihailaexuser2@gmail.com")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser2")));
        }
    }

    @Nested
    @DisplayName("PUT /api/profile")
    class UpdateProfileTests {

        @Test
        @DisplayName("Should update profile successfully when authenticated")
        void shouldUpdateProfileSuccessfully() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            updateRequest.setFirstName("Updated");
            updateRequest.setLastName("Name");
            updateRequest.setEmail("updated@gmail.com");

            mockMvc.perform(put("/api/profile")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.firstName", is("Updated")))
                    .andExpect(jsonPath("$.lastName", is("Name")))
                    .andExpect(jsonPath("$.email", is("updated@gmail.com")))
                    .andExpect(jsonPath("$.username", is("mihailaexuser2")));

            // Verify profile was updated in database
            Profile updatedProfile = profileRepository.findByUser(testUser).orElse(null);
            assertNotNull(updatedProfile);
            assertEquals("Updated", updatedProfile.getFirstName());
            assertEquals("Name", updatedProfile.getLastName());
            assertEquals("updated@gmail.com", updatedProfile.getEmail());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            updateRequest.setFirstName("Updated");
            updateRequest.setLastName("Name");
            updateRequest.setEmail("updated@gmail.com");

            mockMvc.perform(put("/api/profile")
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should update profile with partial data")
        void shouldUpdateProfileWithPartialData() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            updateRequest.setFirstName("OnlyFirst");
            // lastName and email not set

            mockMvc.perform(put("/api/profile")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.firstName", is("OnlyFirst")));
        }

        @Test
        @DisplayName("Should handle empty profile update")
        void shouldHandleEmptyProfileUpdate() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            // All fields null/empty

            mockMvc.perform(put("/api/profile")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON));
        }

        @Test
        @DisplayName("Should fail without CSRF token")
        void shouldFailWithoutCsrfToken() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            updateRequest.setFirstName("Updated");
            updateRequest.setLastName("Name");
            updateRequest.setEmail("updated@gmail.com");

            mockMvc.perform(put("/api/profile")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Should update profile with long names")
        void shouldUpdateProfileWithLongNames() throws Exception {
            ProfileRequest updateRequest = new ProfileRequest();
            updateRequest.setFirstName("VeryLongFirstNameThatShouldStillBeHandledCorrectly");
            updateRequest.setLastName("VeryLongLastNameThatShouldStillBeHandledCorrectly");
            updateRequest.setEmail("verylongemail@verylongdomainname.com");

            mockMvc.perform(put("/api/profile")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName", is("VeryLongFirstNameThatShouldStillBeHandledCorrectly")))
                    .andExpect(jsonPath("$.lastName", is("VeryLongLastNameThatShouldStillBeHandledCorrectly")));
        }
    }
}