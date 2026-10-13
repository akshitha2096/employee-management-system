package com.ems.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AuthController {

    /** Public health check - used by Render / Railway and for a quick browser test. */
    @GetMapping("/")
    public Map<String, String> health() {
        return Map.of("status", "UP", "app", "Employee Management System API");
    }

    /** Protected: succeeds only when valid admin credentials are sent. */
    @GetMapping("/api/auth/login")
    public Map<String, String> login(Authentication authentication) {
        return Map.of("status", "success", "username", authentication.getName());
    }
}
