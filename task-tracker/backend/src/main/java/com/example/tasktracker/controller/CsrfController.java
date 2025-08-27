package com.example.tasktracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {

    @GetMapping("/api/csrf")
    public ResponseEntity<?> getCsrfToken() {
        // Return an empty response which will include the XSRF-TOKEN cookie
        // when using CookieCsrfTokenRepository.withHttpOnlyFalse()
        return ResponseEntity.ok().build();
    }
}