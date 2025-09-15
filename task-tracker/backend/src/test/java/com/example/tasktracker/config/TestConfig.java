package com.example.tasktracker.config;

import com.example.tasktracker.entity.User;
import com.example.tasktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;

import jakarta.annotation.PostConstruct;

@TestConfiguration
@ActiveProfiles("test")
public class TestConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void setupTestData() {
        // Create test users if they don't exist
        if (userRepository.findByUsername("mihailaexuser").isEmpty()) {
            User testUser = new User();
            testUser.setUsername("mihailaexuser");
            testUser.setEmail("test@gmail.com");
            testUser.setPassword(passwordEncoder.encode("testpass123"));
            userRepository.save(testUser);
        }

        if (userRepository.findByUsername("admin").isEmpty()) {
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@gmail.com");
            adminUser.setPassword(passwordEncoder.encode("adminpass123"));
            userRepository.save(adminUser);
        }
    }

    public static SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor mockUser() {
        return SecurityMockMvcRequestPostProcessors.user("mihailaexuser").password("testpass123").roles("USER");
    }

    public static SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor mockAdmin() {
        return SecurityMockMvcRequestPostProcessors.user("admin").password("adminpass123").roles("ADMIN", "USER");
    }
}