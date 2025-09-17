package com.example.tasktracker.controller;

import com.example.tasktracker.base.BaseIntegrationTest;
import com.example.tasktracker.config.TestConfig;
import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.entity.Tag;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.TaskStatus;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.TagRepository;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("TaskController Integration Tests")
@Transactional
class TaskControllerTest extends BaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private User otherUser;
    private Task testTask1;
    private Task testTask2;
    private Tag workTag;
    private Tag personalTag;

    @BeforeEach
    void setUpTestData() {
        // Clean existing data
        taskRepository.deleteAll();
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

        // Create test tags
        workTag = new Tag();
        workTag.setName("Work");
        workTag.setColor("#FF5733");
        workTag.setUser(testUser);
        workTag.setCreatedAt(LocalDateTime.now());
        workTag.setUpdatedAt(LocalDateTime.now());
        workTag = tagRepository.save(workTag);

        personalTag = new Tag();
        personalTag.setName("Personal");
        personalTag.setColor("#3B82F6");
        personalTag.setUser(testUser);
        personalTag.setCreatedAt(LocalDateTime.now());
        personalTag.setUpdatedAt(LocalDateTime.now());
        personalTag = tagRepository.save(personalTag);

        // Create test tasks for testUser
        testTask1 = new Task();
        testTask1.setTitle("Complete project");
        testTask1.setDescription("Finish the task management project");
        testTask1.setStatus(TaskStatus.TODO);
        testTask1.setUser(testUser);
        testTask1.setCreatedAt(LocalDateTime.now());
        testTask1.setUpdatedAt(LocalDateTime.now());
        testTask1 = taskRepository.save(testTask1);

        testTask2 = new Task();
        testTask2.setTitle("Review code");
        testTask2.setDescription("Review the PR submitted by team member");
        testTask2.setStatus(TaskStatus.IN_PROGRESS);
        testTask2.setUser(testUser);
        testTask2.setCreatedAt(LocalDateTime.now());
        testTask2.setUpdatedAt(LocalDateTime.now());
        testTask2 = taskRepository.save(testTask2);

        // Create a task for otherUser (should not be accessible)
        Task otherTask = new Task();
        otherTask.setTitle("Other user task");
        otherTask.setDescription("Should not be visible");
        otherTask.setStatus(TaskStatus.TODO);
        otherTask.setUser(otherUser);
        otherTask.setCreatedAt(LocalDateTime.now());
        otherTask.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(otherTask);
    }

    @Nested
    @DisplayName("GET /api/tasks")
    class GetAllTasksTests {

        @Test
        @DisplayName("Should return all tasks for authenticated user")
        void shouldReturnAllTasksForAuthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/tasks")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].title", anyOf(is("Complete project"), is("Review code"))))
                    .andExpect(jsonPath("$[1].title", anyOf(is("Complete project"), is("Review code"))))
                    .andExpect(jsonPath("$[0].status", anyOf(is("TODO"), is("IN_PROGRESS"))))
                    .andExpect(jsonPath("$[1].status", anyOf(is("TODO"), is("IN_PROGRESS"))));
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tasks"))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return empty list when user has no tasks")
        void shouldReturnEmptyListWhenUserHasNoTasks() throws Exception {
            // Delete all tasks for testUser
            taskRepository.deleteAll();

            mockMvc.perform(get("/api/tasks")
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/tasks/{id}")
    class GetTaskByIdTests {

        @Test
        @DisplayName("Should return task when it belongs to authenticated user")
        void shouldReturnTaskWhenItBelongsToUser() throws Exception {
            mockMvc.perform(get("/api/tasks/{id}", testTask1.getId())
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id", is(testTask1.getId().intValue())))
                    .andExpect(jsonPath("$.title", is("Complete project")))
                    .andExpect(jsonPath("$.description", is("Finish the task management project")))
                    .andExpect(jsonPath("$.status", is("TODO")));
        }

        @Test
        @DisplayName("Should return not found when task doesn't exist")
        void shouldReturnNotFoundWhenTaskDoesntExist() throws Exception {
            mockMvc.perform(get("/api/tasks/{id}", 999999L)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/api/tasks/{id}", testTask1.getId()))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("POST /api/tasks")
    class CreateTaskTests {

        @Test
        @DisplayName("Should create task successfully")
        void shouldCreateTaskSuccessfully() throws Exception {
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setTitle("New Task");
            taskRequest.setDescription("Description of new task");
            taskRequest.setStatus(TaskStatus.TODO);

            mockMvc.perform(post("/api/tasks")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(taskRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.title", is("New Task")))
                    .andExpect(jsonPath("$.description", is("Description of new task")))
                    .andExpect(jsonPath("$.status", is("TODO")))
                    .andExpect(jsonPath("$.id", notNullValue()))
                    .andExpect(jsonPath("$.createdAt", notNullValue()))
                    .andExpect(jsonPath("$.updatedAt", notNullValue()));

            // Verify task was created in database  
            List<Task> userTasks = taskRepository.findByUser(testUser);
            assertTrue(userTasks.stream().anyMatch(task -> "New Task".equals(task.getTitle())));
        }

        @Test
        @DisplayName("Should create task with tags")
        void shouldCreateTaskWithTags() throws Exception {
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setTitle("Task with tags");
            taskRequest.setDescription("Task that has associated tags");
            taskRequest.setStatus(TaskStatus.TODO);
            taskRequest.setTagIds(Arrays.asList(workTag.getId(), personalTag.getId()));

            mockMvc.perform(post("/api/tasks")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(taskRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title", is("Task with tags")))
                    .andExpect(jsonPath("$.tags", hasSize(2)));
        }

        @Test
        @DisplayName("Should create task with minimal data")
        void shouldCreateTaskWithMinimalData() throws Exception {
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setTitle("Minimal Task");
            // description, status, and tags not set

            mockMvc.perform(post("/api/tasks")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(taskRequest)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.title", is("Minimal Task")))
                    .andExpect(jsonPath("$.status", is("TODO"))); // Default status
        }

        @Test
        @DisplayName("Should fail to create task with empty title")
        void shouldFailToCreateTaskWithEmptyTitle() throws Exception {
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setTitle("");
            taskRequest.setDescription("Task with empty title");

            mockMvc.perform(post("/api/tasks")
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(taskRequest)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            TaskRequest taskRequest = new TaskRequest();
            taskRequest.setTitle("Unauthorized task");
            taskRequest.setDescription("This should fail");

            mockMvc.perform(post("/api/tasks")
                    .contentType(JSON)
                    .content(toJson(taskRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /api/tasks/{id}")
    class UpdateTaskTests {

        @Test
        @DisplayName("Should update task successfully")
        void shouldUpdateTaskSuccessfully() throws Exception {
            TaskRequest updateRequest = new TaskRequest();
            updateRequest.setTitle("Updated Task");
            updateRequest.setDescription("Updated description");
            updateRequest.setStatus(TaskStatus.DONE);

            mockMvc.perform(put("/api/tasks/{id}", testTask1.getId())
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(JSON))
                    .andExpect(jsonPath("$.id", is(testTask1.getId().intValue())))
                    .andExpect(jsonPath("$.title", is("Updated Task")))
                    .andExpect(jsonPath("$.description", is("Updated description")))
                    .andExpect(jsonPath("$.status", is("DONE")));

            // Verify task was updated in database
            Task updatedTask = taskRepository.findById(testTask1.getId()).orElse(null);
            assertNotNull(updatedTask);
            assertEquals("Updated Task", updatedTask.getTitle());
            assertEquals("Updated description", updatedTask.getDescription());
            assertEquals(TaskStatus.DONE, updatedTask.getStatus());
        }

        @Test
        @DisplayName("Should update task status only")
        void shouldUpdateTaskStatusOnly() throws Exception {
            TaskRequest updateRequest = new TaskRequest();
            updateRequest.setTitle(testTask1.getTitle()); // Keep original
            updateRequest.setDescription(testTask1.getDescription()); // Keep original
            updateRequest.setStatus(TaskStatus.IN_PROGRESS); // Change status

            mockMvc.perform(put("/api/tasks/{id}", testTask1.getId())
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
        }

        @Test
        @DisplayName("Should return not found when task doesn't exist")
        void shouldReturnNotFoundWhenTaskDoesntExist() throws Exception {
            TaskRequest updateRequest = new TaskRequest();
            updateRequest.setTitle("Updated Task");
            updateRequest.setDescription("Updated description");
            updateRequest.setStatus(TaskStatus.DONE);

            mockMvc.perform(put("/api/tasks/{id}", 999999L)
                    .with(TestConfig.mockUser())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            TaskRequest updateRequest = new TaskRequest();
            updateRequest.setTitle("Updated Task");
            updateRequest.setDescription("Updated description");

            mockMvc.perform(put("/api/tasks/{id}", testTask1.getId())
                    .contentType(JSON)
                    .content(toJson(updateRequest)))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("DELETE /api/tasks/{id}")
    class DeleteTaskTests {

        @Test
        @DisplayName("Should delete task successfully")
        void shouldDeleteTaskSuccessfully() throws Exception {
            Long taskIdToDelete = testTask1.getId();

            mockMvc.perform(delete("/api/tasks/{id}", taskIdToDelete)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNoContent());

            // Verify task was deleted from database
            assertFalse(taskRepository.existsById(taskIdToDelete));
        }

        @Test
        @DisplayName("Should return not found when task doesn't exist")
        void shouldReturnNotFoundWhenTaskDoesntExist() throws Exception {
            mockMvc.perform(delete("/api/tasks/{id}", 999999L)
                    .with(TestConfig.mockUser()))
                    .andDo(print())
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return unauthorized when not authenticated")
        void shouldReturnUnauthorizedWhenNotAuthenticated() throws Exception {
            mockMvc.perform(delete("/api/tasks/{id}", testTask1.getId()))
                    .andDo(print())
                    .andExpect(status().isUnauthorized());
        }
    }
}