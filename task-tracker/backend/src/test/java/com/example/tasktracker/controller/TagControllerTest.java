package com.example.tasktracker.controller;

import com.example.tasktracker.base.BaseIntegrationTest;
import com.example.tasktracker.config.TestConfig;
import com.example.tasktracker.dto.TagRequest;
import com.example.tasktracker.entity.Tag;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.TagRepository;
import com.example.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("TagController Integration Tests")
@Transactional
class TagControllerTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User otherUser;
    private Tag testTag1;
    private Tag testTag2;

    @BeforeEach
    void setUpTestData() {
        // Clean existing data
        tagRepository.deleteAll();
        userRepository.deleteAll();
        
        // Create test users
        testUser = new User();
        testUser.setUsername("mihailaexuser");
        testUser.setEmail("mihailaexuser@gmail.com");
        testUser.setPassword(passwordEncoder.encode("pRH8F8cu@FYhRqG"));
        testUser = userRepository.save(testUser);

        otherUser = new User();
        otherUser.setUsername("otheruser");
        otherUser.setEmail("other@gmail.com");
        otherUser.setPassword(passwordEncoder.encode("password123"));
        otherUser = userRepository.save(otherUser);

        // Create test tags for testUser
        testTag1 = new Tag();
        testTag1.setName("Work");
        testTag1.setColor("#FF5733");
        testTag1.setUser(testUser);
        testTag1.setCreatedAt(LocalDateTime.now());
        testTag1.setUpdatedAt(LocalDateTime.now());
        testTag1 = tagRepository.save(testTag1);

        testTag2 = new Tag();
        testTag2.setName("Personal");
        testTag2.setColor("#3B82F6");
        testTag2.setUser(testUser);
        testTag2.setCreatedAt(LocalDateTime.now());
        testTag2.setUpdatedAt(LocalDateTime.now());
        testTag2 = tagRepository.save(testTag2);

        // Create a tag for otherUser (should not be accessible)
        Tag otherTag = new Tag();
        otherTag.setName("Other Work");
        otherTag.setColor("#10B981");
        otherTag.setUser(otherUser);
        otherTag.setCreatedAt(LocalDateTime.now());
        otherTag.setUpdatedAt(LocalDateTime.now());
        tagRepository.save(otherTag);
    }

    @Nested
    @DisplayName("GET /api/tags")
    class GetAllTagsTests {

        @Test
        @DisplayName("Should return all tags for authenticated user")
        void shouldReturnAllTagsForAuthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/tags")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].name", anyOf(is("Work"), is("Personal"))))
                    .andExpect(jsonPath("$[1].name", anyOf(is("Work"), is("Personal"))));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tags"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return empty list when user has no tags")
        void shouldReturnEmptyListWhenUserHasNoTags() throws Exception {
            // Delete all tags for testUser
            tagRepository.deleteAll();

            mockMvc.perform(get("/api/tags")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("POST /api/tags")
    class CreateTagTests {

        @Test
        @DisplayName("Should create tag successfully")
        void shouldCreateTagSuccessfully() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("New Tag");
            tagRequest.setColor("#FF6B6B");

            mockMvc.perform(post("/api/tags")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.name", is("New Tag")))
                    .andExpect(jsonPath("$.color", is("#FF6B6B")))
                    .andExpect(jsonPath("$.id", notNullValue()));

            // Verify tag was created in database
            assertTrue(tagRepository.existsByNameAndUser("New Tag", testUser));
        }

        @Test
        @DisplayName("Should create tag with default color when color not specified")
        void shouldCreateTagWithDefaultColor() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("Default Color Tag");
            // color not set

            mockMvc.perform(post("/api/tags")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name", is("Default Color Tag")))
                    .andExpect(jsonPath("$.color", notNullValue()));
        }

        @Test
        @DisplayName("Should fail to create tag with duplicate name")
        void shouldFailToCreateTagWithDuplicateName() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("Work"); // Already exists for this user
            tagRequest.setColor("#FF6B6B");

            mockMvc.perform(post("/api/tags")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should fail to create tag with empty name")
        void shouldFailToCreateTagWithEmptyName() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("");
            tagRequest.setColor("#FF6B6B");

            mockMvc.perform(post("/api/tags")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should fail to create tag with invalid color format")
        void shouldFailToCreateTagWithInvalidColor() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("Invalid Color");
            tagRequest.setColor("invalid-color");

            mockMvc.perform(post("/api/tags")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            TagRequest tagRequest = new TagRequest();
            tagRequest.setName("New Tag");
            tagRequest.setColor("#FF6B6B");

            mockMvc.perform(post("/api/tags")
                    .contentType(JSON)
                    .content(toJson(tagRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/tags/{id}")
    class GetTagByIdTests {

        @Test
        @DisplayName("Should return tag when it belongs to authenticated user")
        void shouldReturnTagWhenItBelongsToUser() throws Exception {
            mockMvc.perform(get("/api/tags/{id}", testTag1.getId())
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id", is(testTag1.getId().intValue())))
                    .andExpect(jsonPath("$.name", is("Work")))
                    .andExpect(jsonPath("$.color", is("#FF5733")));
        }

        @Test
        @DisplayName("Should return not found when tag doesn't exist")
        void shouldReturnNotFoundWhenTagDoesntExist() throws Exception {
            mockMvc.perform(get("/api/tags/{id}", 999999L)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tags/{id}", testTag1.getId()))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/tags/{id}")
    class UpdateTagTests {

        @Test
        @DisplayName("Should update tag successfully")
        void shouldUpdateTagSuccessfully() throws Exception {
            TagRequest updateRequest = new TagRequest();
            updateRequest.setName("Updated Work");
            updateRequest.setColor("#FF9999");

            mockMvc.perform(put("/api/tags/{id}", testTag1.getId())
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id", is(testTag1.getId().intValue())))
                    .andExpect(jsonPath("$.name", is("Updated Work")))
                    .andExpect(jsonPath("$.color", is("#FF9999")));

            // Verify tag was updated in database
            Tag updatedTag = tagRepository.findById(testTag1.getId()).orElse(null);
            assertNotNull(updatedTag);
            assertEquals("Updated Work", updatedTag.getName());
            assertEquals("#FF9999", updatedTag.getColor());
        }

        @Test
        @DisplayName("Should return not found when tag doesn't exist")
        void shouldReturnNotFoundWhenTagDoesntExist() throws Exception {
            TagRequest updateRequest = new TagRequest();
            updateRequest.setName("Updated Tag");
            updateRequest.setColor("#FF9999");

            mockMvc.perform(put("/api/tags/{id}", 999999L)
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            TagRequest updateRequest = new TagRequest();
            updateRequest.setName("Updated Tag");
            updateRequest.setColor("#FF9999");

            mockMvc.perform(put("/api/tags/{id}", testTag1.getId())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("DELETE /api/tags/{id}")
    class DeleteTagTests {

        @Test
        @DisplayName("Should delete tag successfully")
        void shouldDeleteTagSuccessfully() throws Exception {
            Long tagIdToDelete = testTag1.getId();

            mockMvc.perform(delete("/api/tags/{id}", tagIdToDelete)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNoContent());

            // Verify tag was deleted from database
            assertFalse(tagRepository.existsById(tagIdToDelete));
        }

        @Test
        @DisplayName("Should return not found when tag doesn't exist")
        void shouldReturnNotFoundWhenTagDoesntExist() throws Exception {
            mockMvc.perform(delete("/api/tags/{id}", 999999L)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(delete("/api/tags/{id}", testTag1.getId()))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/tags/search")
    class SearchTagsTests {

        @Test
        @DisplayName("Should search tags by name")
        void shouldSearchTagsByName() throws Exception {
            mockMvc.perform(get("/api/tags/search")
                    .param("q", "Work")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Work")));
        }

        @Test
        @DisplayName("Should return empty list when no tags match search")
        void shouldReturnEmptyListWhenNoTagsMatch() throws Exception {
            mockMvc.perform(get("/api/tags/search")
                    .param("q", "NonExistent")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should perform partial match search")
        void shouldPerformPartialMatchSearch() throws Exception {
            mockMvc.perform(get("/api/tags/search")
                    .param("q", "Per")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name", is("Personal")));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tags/search")
                    .param("q", "Work"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("GET /api/tags/count")
    class GetTagCountTests {

        @Test
        @DisplayName("Should return tag count for authenticated user")
        void shouldReturnTagCountForAuthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/tags/count")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("2"));
        }

        @Test
        @DisplayName("Should return zero when user has no tags")
        void shouldReturnZeroWhenUserHasNoTags() throws Exception {
            // Delete all tags for testUser
            tagRepository.deleteAll();

            mockMvc.perform(get("/api/tags/count")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().string("0"));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tags/count"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }
}