package com.example.tasktracker.repository;

import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Find tasks by their associated user.
     */
    List<Task> findByUser(User user);

    /**
     * Find tasks by their associated user and status.
     */
    List<Task> findByUserAndStatus(User user, com.example.tasktracker.entity.TaskStatus status);

    /**
     * Search tasks by title or description containing the query string
     * (case-insensitive).
     */
    List<Task> findByUserAndTitleContainingIgnoreCaseOrUserAndDescriptionContainingIgnoreCase(
            User user1, String titleQuery, User user2, String descriptionQuery);

}