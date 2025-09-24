package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.service.TaskService;
import com.example.tasktracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                return user.getId();
            }
        }
        throw new RuntimeException("Unable to get current user ID");
    }

    /**
     * Get all tasks for the current user
     */
    @GetMapping
    public List<TaskResponse> getAllTasks() {
        Long userId = getCurrentUserId();
        return taskService.getAllTasks(userId);
    }

    /**
     * Get a specific task by ID for the current user
     */
    @GetMapping("/{id}")
    public TaskResponse getTaskById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return taskService.getTaskById(id, userId);
    }

    /**
     * Create a new task for the current user
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@Valid @RequestBody TaskRequest taskRequest) {
        Long userId = getCurrentUserId();
        return taskService.createTask(taskRequest, userId);
    }

    /**
     * Update an existing task for the current user
     */
    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        Long userId = getCurrentUserId();
        return taskService.updateTask(id, taskRequest, userId);
    }

    /**
     * Delete a task by ID for the current user
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        taskService.deleteTask(id, userId);
    }
}