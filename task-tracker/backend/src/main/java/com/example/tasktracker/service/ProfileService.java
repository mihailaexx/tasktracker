package com.example.tasktracker.service;

import com.example.tasktracker.dto.ProfileRequest;
import com.example.tasktracker.dto.ProfileResponse;
import com.example.tasktracker.entity.Profile;
import com.example.tasktracker.entity.User;
import com.example.tasktracker.exception.UserNotFoundException;
import com.example.tasktracker.repository.ProfileRepository;
import com.example.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Profile profile = profileRepository.findByUser(user)
                .orElse(new Profile()); // Return empty profile if not found
        
        return convertToResponse(profile, user);
    }

    public ProfileResponse updateProfile(ProfileRequest profileRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Profile profile = profileRepository.findByUser(user)
                .orElse(new Profile());
        
        try {
            // Update profile fields
            profile.setFirstName(profileRequest.getFirstName());
            profile.setLastName(profileRequest.getLastName());
            profile.setEmail(profileRequest.getEmail());
            profile.setUser(user);
            
            Profile savedProfile = profileRepository.save(profile);
            return convertToResponse(savedProfile, user);
        } catch (DataIntegrityViolationException e) {
            // Handle email uniqueness constraint violation
            throw new IllegalArgumentException("Email already exists");
        }
    }

    private ProfileResponse convertToResponse(Profile profile, User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setFirstName(profile.getFirstName());
        response.setLastName(profile.getLastName());
        response.setEmail(profile.getEmail());
        response.setUsername(user.getUsername());
        return response;
    }
}