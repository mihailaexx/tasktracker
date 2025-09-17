package com.example.tasktracker.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;


@TestConfiguration
@ActiveProfiles("test")
public class TestConfig {

    public static SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor mockUser() {
        return SecurityMockMvcRequestPostProcessors.user("mihailaexuser").password("pRH8F8cu@FYhRqG").roles("USER");
    }

    public static SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor mockAdmin() {
        return SecurityMockMvcRequestPostProcessors.user("admin").password("adminpass123").roles("ADMIN", "USER");
    }
}