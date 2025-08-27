package com.example.tasktracker.controller;

import com.example.tasktracker.dto.ProfileRequest;
import com.example.tasktracker.dto.ProfileResponse;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.service.ProfileService;
import com.example.tasktracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        Long userId = getCurrentUserId();
        ProfileResponse profile = profileService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileRequest profileRequest) {
        Long userId = getCurrentUserId();
        ProfileResponse updatedProfile = profileService.updateProfile(profileRequest, userId);
        return ResponseEntity.ok(updatedProfile);
    }
}