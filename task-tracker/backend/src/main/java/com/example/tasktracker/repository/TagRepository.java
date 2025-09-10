package com.example.tasktracker.repository;

import com.example.tasktracker.entity.Tag;
import com.example.tasktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    
    /**
     * Find all tags belonging to a specific user
     */
    List<Tag> findByUserOrderByNameAsc(User user);
    
    /**
     * Find all tags belonging to a specific user by user ID
     */
    @Query("SELECT t FROM Tag t WHERE t.user.id = :userId ORDER BY t.name ASC")
    List<Tag> findByUserIdOrderByNameAsc(@Param("userId") Long userId);
    
    /**
     * Find a tag by name and user (for uniqueness check)
     */
    Optional<Tag> findByNameAndUser(String name, User user);
    
    /**
     * Find tags by name containing a specific string (case insensitive) for a user
     */
    @Query("SELECT t FROM Tag t WHERE t.user.id = :userId AND LOWER(t.name) LIKE LOWER(CONCAT('%', :nameContains, '%')) ORDER BY t.name ASC")
    List<Tag> findByUserIdAndNameContainingIgnoreCase(@Param("userId") Long userId, @Param("nameContains") String nameContains);
    
    /**
     * Find tags by IDs and user (for validation when assigning tags to tasks)
     */
    @Query("SELECT t FROM Tag t WHERE t.id IN :tagIds AND t.user.id = :userId")
    List<Tag> findByIdsAndUserId(@Param("tagIds") List<Long> tagIds, @Param("userId") Long userId);
    
    /**
     * Check if a tag exists by name for a specific user
     */
    boolean existsByNameAndUser(String name, User user);
    
    /**
     * Count tags for a specific user
     */
    long countByUser(User user);
}
