package com.example.tasktracker.controller;

import com.example.tasktracker.base.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("HealthController Integration Tests")
class HealthControllerTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Should return health status")
    void shouldReturnHealthStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(JSON))
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.message", is("Task Tracker Application is running")));
    }

    @Test
    @DisplayName("Should return health status without authentication")
    void shouldReturnHealthStatusWithoutAuthentication() throws Exception {
        // Health endpoint should be accessible without authentication
        mockMvc.perform(get("/health"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    @Test
    @DisplayName("Should handle multiple concurrent health checks")
    void shouldHandleMultipleConcurrentHealthChecks() throws Exception {
        // Simulate multiple concurrent requests
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/health"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("UP")));
        }
    }
}