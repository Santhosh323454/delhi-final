package com.ayursutra.controller;

import com.ayursutra.model.Patient;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
// CORS is handled globally in SecurityConfig.java
public class PatientController {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<Patient> getMyProfile(Authentication authentication) {
        Patient patient = patientRepository.findByUserId(
                userRepository.findByUsername(authentication.getName()).orElseThrow().getId())
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        return ResponseEntity.ok(patient);
    }
}
