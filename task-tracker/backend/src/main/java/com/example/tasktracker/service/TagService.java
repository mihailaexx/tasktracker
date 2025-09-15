package com.example.tasktracker.service;

import com.example.tasktracker.dto.TagRequest;
import com.example.tasktracker.dto.TagResponse;
import com.example.tasktracker.entity.Tag;
import com.example.tasktracker.entity.Task;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.exception.UserNotFoundException;
import com.example.tasktracker.repository.TagRepository;
import com.example.tasktracker.repository.TaskRepository;
import com.example.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Get all tags for a user
     */
    public List<TagResponse> getUserTags(Long userId) {
        User user = getUserById(userId);
        List<Tag> tags = tagRepository.findByUserOrderByNameAsc(user);
        return tags.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new tag for a user
     */
    public TagResponse createTag(TagRequest tagRequest, Long userId) {
        User user = getUserById(userId);
        
        // Check if tag name already exists for this user
        if (tagRepository.existsByNameAndUser(tagRequest.getName(), user)) {
            throw new IllegalArgumentException("Tag with name '" + tagRequest.getName() + "' already exists");
        }

        try {
            Tag tag = new Tag();
            tag.setName(tagRequest.getName().trim());
            tag.setColor(tagRequest.getColor() != null ? tagRequest.getColor() : "#3B82F6");
            tag.setUser(user);

            Tag savedTag = tagRepository.save(tag);
            return convertToResponse(savedTag);
        } catch (DataIntegrityViolationException e) {
            // Fallback for race condition - handle constraint violation
            throw new IllegalArgumentException("Tag with name '" + tagRequest.getName() + "' already exists");
        }
    }

    /**
     * Update an existing tag
     */
    public TagResponse updateTag(Long tagId, TagRequest tagRequest, Long userId) {
        Tag tag = getTagByIdAndUser(tagId, userId);
        
        // Check if the new name conflicts with existing tags (excluding current tag)
        if (!tag.getName().equals(tagRequest.getName().trim())) {
            if (tagRepository.existsByNameAndUser(tagRequest.getName().trim(), tag.getUser())) {
                throw new IllegalArgumentException("Tag with name '" + tagRequest.getName() + "' already exists");
            }
        }

        try {
            tag.setName(tagRequest.getName().trim());
            if (tagRequest.getColor() != null) {
                tag.setColor(tagRequest.getColor());
            }

            Tag updatedTag = tagRepository.save(tag);
            return convertToResponse(updatedTag);
        } catch (DataIntegrityViolationException e) {
            // Fallback for race condition - handle constraint violation
            throw new IllegalArgumentException("Tag with name '" + tagRequest.getName() + "' already exists");
        }
    }

    /**
     * Delete a tag
     */
    public void deleteTag(Long tagId, Long userId) {
        Tag tag = getTagByIdAndUser(tagId, userId);
        
        // First, remove this tag from all tasks that use it
        User user = getUserById(userId);
        List<Task> userTasks = taskRepository.findByUser(user);
        
        for (Task task : userTasks) {
            if (task.getTags().contains(tag)) {
                task.removeTag(tag);
                taskRepository.save(task);
            }
        }
        
        // Now delete the tag
        tagRepository.delete(tag);
    }

    /**
     * Get a specific tag by ID for a user
     */
    public TagResponse getTag(Long tagId, Long userId) {
        Tag tag = getTagByIdAndUser(tagId, userId);
        return convertToResponse(tag);
    }

    /**
     * Search tags by name for a user
     */
    public List<TagResponse> searchTags(String query, Long userId) {
        List<Tag> tags = tagRepository.findByUserIdAndNameContainingIgnoreCase(userId, query);
        return tags.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get tags by IDs for a specific user (used when assigning tags to tasks)
     */
    public List<Tag> getTagsByIdsAndUser(List<Long> tagIds, Long userId) {
        return tagRepository.findByIdsAndUserId(tagIds, userId);
    }

    /**
     * Get tag count for a user
     */
    public long getTagCount(Long userId) {
        User user = getUserById(userId);
        return tagRepository.countByUser(user);
    }

    // Helper methods

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }

    private Tag getTagByIdAndUser(Long tagId, Long userId) {
        return tagRepository.findById(tagId)
                .filter(tag -> tag.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Tag not found with id: " + tagId));
    }

    private TagResponse convertToResponse(Tag tag) {
        return new TagResponse(
                tag.getId(),
                tag.getName(),
                tag.getColor(),
                tag.getCreatedAt(),
                tag.getUpdatedAt()
        );
    }
}
