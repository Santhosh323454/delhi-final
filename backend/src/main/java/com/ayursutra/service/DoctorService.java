package com.ayursutra.service;

import com.ayursutra.dto.PatientCreateRequest;
import com.ayursutra.dto.PatientResponse;
import com.ayursutra.model.Doctor;
import com.ayursutra.model.Patient;
import com.ayursutra.model.Role;
import com.ayursutra.model.User;
import com.ayursutra.repository.DoctorRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#";

    @org.springframework.transaction.annotation.Transactional
    public PatientResponse addPatient(String doctorUsername, PatientCreateRequest request) {
        // Verify the logged-in user has a Doctor profile
        User doctorUser = userRepository.findByUsername(doctorUsername)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
        Doctor doctor = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new RuntimeException("No Doctor profile found for this account. Please contact the admin."));

        // Check for existing email or phone to give a clear error
        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("A patient with this email address already exists.");
        }
        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("A patient with this phone number already exists.");
        }

        // Generate ID: AS-2026-XXX
        long count = patientRepository.count() + 1;
        String generatedUsername = String.format("AS-2026-%03d", count);

        // Generate random 8 char password
        String generatedPassword = generateRandomPassword(8);

        User user = User.builder()
                .username(generatedUsername)
                .password(passwordEncoder.encode(generatedPassword))
                .plainPassword(generatedPassword)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(Role.PATIENT)
                .build();
        User savedUser = userRepository.save(user);

        // Store prakriti in customNotes for now
        String prakritiNote = request.getPrakriti() != null ? "Prakriti: " + request.getPrakriti() : null;

        Patient patient = Patient.builder()
                .user(savedUser)
                .doctor(doctor)
                .currentTherapy(request.getCurrentTherapy())
                .recoveryProgress(0)
                .customNotes(prakritiNote)
                .build();
        patientRepository.save(patient);

        return PatientResponse.builder()
                .id(patient.getId())
                .username(generatedUsername)
                .password(generatedPassword) // Returned ONLY ONCE for the doctor to give to the patient
                .name(savedUser.getName())
                .currentTherapy(patient.getCurrentTherapy())
                .build();
    }

    public List<Patient> getMyPatients(String doctorUsername) {
        Doctor doctor = doctorRepository.findByUserId(
                userRepository.findByUsername(doctorUsername).orElseThrow().getId()).orElseThrow();
        return doctor.getPatients();
    }

    private String generateRandomPassword(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }

    public List<String> getSpecializations() {
        return doctorRepository.findDistinctSpecializations()
                .stream()
                .filter(s -> s != null && !s.trim().isEmpty())
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(java.util.stream.Collectors.toList());
    }
}
