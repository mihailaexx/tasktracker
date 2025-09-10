package com.example.tasktracker.dto;

import com.example.tasktracker.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private TaskStatus status = TaskStatus.TODO;
    
    // List of tag IDs to associate with the task
    private List<Long> tagIds = new ArrayList<>();
}