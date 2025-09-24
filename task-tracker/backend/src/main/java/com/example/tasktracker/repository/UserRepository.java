package com.example.tasktracker.repository;

import com.example.tasktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find a user by their username.
     */
    Optional<User> findByUsername(String username);
    
}