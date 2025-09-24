package com.example.tasktracker.service;

import com.example.tasktracker.dto.TagResponse;
import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskResponse;
import com.example.tasktracker.entity.Tag;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.exception.UserNotFoundException;
import com.example.tasktracker.exception.TaskNotFoundException;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TagService tagService;

    /**
     * Get all tasks for a specific user
     */
    public List<TaskResponse> getAllTasks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return taskRepository.findByUser(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a task by ID for a specific user
     */
    public TaskResponse getTaskById(Long taskId, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));
        
        // Ensure the task belongs to the user
        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task does not belong to the user");
        }
        
        return convertToResponse(task);
    }

    /**
     * Create a new task for a specific user
     */
    public TaskResponse createTask(TaskRequest taskRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        task.setUser(user);
        
        // Handle tags if provided
        if (taskRequest.getTagIds() != null && !taskRequest.getTagIds().isEmpty()) {
            List<Tag> tags = tagService.getTagsByIdsAndUser(taskRequest.getTagIds(), userId);
            task.getTags().addAll(tags);
        }
        
        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    /**
     * Update a task by ID for a specific user
     */
    public TaskResponse updateTask(Long taskId, TaskRequest taskRequest, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));
        
        // Ensure the task belongs to the user
        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task does not belong to the user");
        }
        
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(taskRequest.getStatus());
        
        // Handle tags update
        task.clearTags(); // Clear existing tags
        if (taskRequest.getTagIds() != null && !taskRequest.getTagIds().isEmpty()) {
            List<Tag> tags = tagService.getTagsByIdsAndUser(taskRequest.getTagIds(), userId);
            task.getTags().addAll(tags);
        }
        
        Task updatedTask = taskRepository.save(task);
        return convertToResponse(updatedTask);
    }

    /**
     * Delete a task by ID for a specific user
     */
    public void deleteTask(Long taskId, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));
        
        // Ensure the task belongs to the user
        if (!task.getUser().getId().equals(userId)) {
            throw new RuntimeException("Task does not belong to the user");
        }
        
        taskRepository.delete(task);
    }

    // Helper methods

    private TaskResponse convertToResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        
        // Convert tags to TagResponse objects
        List<TagResponse> tagResponses = task.getTags().stream()
                .map(tag -> new TagResponse(tag.getId(), tag.getName(), tag.getColor(), 
                           tag.getCreatedAt(), tag.getUpdatedAt()))
                .collect(Collectors.toList());
        response.setTags(tagResponses);
        
        return response;
    }
}