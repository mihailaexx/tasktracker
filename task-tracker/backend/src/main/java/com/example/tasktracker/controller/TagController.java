package com.example.tasktracker.controller;

import com.example.tasktracker.dto.TagRequest;
import com.example.tasktracker.dto.TagResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import com.example.tasktracker.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ResponseStatus;

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
    public List<TagResponse> getAllTags() {
        Long userId = getCurrentUserId();
        return tagService.getUserTags(userId);
    }

    /**
     * Create a new tag
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TagResponse createTag(@Valid @RequestBody TagRequest tagRequest) {
        Long userId = getCurrentUserId();
        return tagService.createTag(tagRequest, userId);
    }

    /**
     * Get a specific tag by ID
     */
    @GetMapping("/{id}")
    public TagResponse getTag(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return tagService.getTag(id, userId);
    }

    /**
     * Update an existing tag
     */
    @PutMapping("/{id}")
    public TagResponse updateTag(@PathVariable Long id, @Valid @RequestBody TagRequest tagRequest) {
        Long userId = getCurrentUserId();
        return tagService.updateTag(id, tagRequest, userId);
    }

    /**
     * Delete a tag
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTag(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        tagService.deleteTag(id, userId);
    }

    /**
     * Search tags by name
     */
    @GetMapping("/search")
    public List<TagResponse> searchTags(@RequestParam("q") String query) {
        Long userId = getCurrentUserId();
        return tagService.searchTags(query, userId);
    }

    /**
     * Get tag count for the current user
     */
    @GetMapping("/count")
    public Long getTagCount() {
        Long userId = getCurrentUserId();
        return tagService.getTagCount(userId);
    }
}
