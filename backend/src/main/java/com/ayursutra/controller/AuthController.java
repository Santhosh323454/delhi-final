package com.ayursutra.controller;

import com.ayursutra.dto.AdminSignupRequest;
import com.ayursutra.dto.AuthRequest;
import com.ayursutra.dto.AuthResponse;
import com.ayursutra.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
// CORS is handled globally in SecurityConfig.java
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/admin/register")
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody AdminSignupRequest request) {
        return ResponseEntity.ok(authService.registerAdmin(request));
    }
}