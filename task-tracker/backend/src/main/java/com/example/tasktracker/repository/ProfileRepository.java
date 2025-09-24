package com.example.tasktracker.repository;

import com.example.tasktracker.entity.Profile;
import com.example.tasktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    /**
     * Find a profile by its associated user.
     */
    Optional<Profile> findByUser(User user);
    
}