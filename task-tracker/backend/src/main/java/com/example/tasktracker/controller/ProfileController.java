package com.example.tasktracker.controller;

import com.example.tasktracker.dto.ProfileRequest;
import com.example.tasktracker.dto.ProfileResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.service.ProfileService;
import com.example.tasktracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    
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
     * Get profile for the current user
     */
    @GetMapping
    public ProfileResponse getProfile() {
        Long userId = getCurrentUserId();
        return profileService.getProfile(userId);
    }

    /**
     * Update profile for the current user
     */
    @PutMapping
    public ProfileResponse updateProfile(@Valid @RequestBody ProfileRequest profileRequest) {
        Long userId = getCurrentUserId();
        return profileService.updateProfile(profileRequest, userId);
    }
}