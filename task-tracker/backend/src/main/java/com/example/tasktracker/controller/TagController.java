package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TagRequest;
import com.example.tasktracker.dto.TagResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import com.example.tasktracker.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

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
     * Get all tags for the current user
     */
    @GetMapping
    public ResponseEntity<List<TagResponse>> getAllTags() {
        try {
            Long userId = getCurrentUserId();
            List<TagResponse> tags = tagService.getUserTags(userId);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new tag
     */
    @PostMapping
    public ResponseEntity<TagResponse> createTag(@Valid @RequestBody TagRequest tagRequest) {
        try {
            Long userId = getCurrentUserId();
            TagResponse createdTag = tagService.createTag(tagRequest, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTag);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get a specific tag by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getTag(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            TagResponse tag = tagService.getTag(id, userId);
            return ResponseEntity.ok(tag);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing tag
     */
    @PutMapping("/{id}")
    public ResponseEntity<TagResponse> updateTag(@PathVariable Long id, @Valid @RequestBody TagRequest tagRequest) {
        try {
            Long userId = getCurrentUserId();
            TagResponse updatedTag = tagService.updateTag(id, tagRequest, userId);
            return ResponseEntity.ok(updatedTag);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a tag
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        try {
            Long userId = getCurrentUserId();
            tagService.deleteTag(id, userId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search tags by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<TagResponse>> searchTags(@RequestParam("q") String query) {
        try {
            Long userId = getCurrentUserId();
            List<TagResponse> tags = tagService.searchTags(query, userId);
            return ResponseEntity.ok(tags);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tag count for the current user
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTagCount() {
        try {
            Long userId = getCurrentUserId();
            long count = tagService.getTagCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
