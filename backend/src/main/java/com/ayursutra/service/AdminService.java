package com.ayursutra.service;

import com.ayursutra.dto.DoctorListResponse;
import com.ayursutra.dto.DoctorSignupRequest;
import com.ayursutra.model.Doctor;
import com.ayursutra.model.Role;
import com.ayursutra.model.TreatmentProtocol;
import com.ayursutra.model.User;
import com.ayursutra.repository.DoctorRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.TreatmentProtocolRepository;
import com.ayursutra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final TreatmentProtocolRepository protocolRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.transaction.annotation.Transactional
    public Doctor addDoctor(DoctorSignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number is already registered");
        }

        long count = doctorRepository.count();
        String generatedId;
        do {
            count++;
            generatedId = String.format("DOC-2026-%03d", count);
        } while (userRepository.existsByUsername(generatedId));

        String autoGenPass = "Ayur@" + (int) (Math.random() * 9000 + 1000);

        User user = User.builder()
                .username(generatedId)
                .password(passwordEncoder.encode(autoGenPass))
                .plainPassword(autoGenPass)
                .email(request.getEmail())
                .name(request.getName())
                .phone(request.getPhone())
                .role(Role.DOCTOR)
                .build();
        User savedUser = userRepository.save(user);

        Doctor doctor = Doctor.builder()
                .user(savedUser)
                .specialization(request.getSpecialization())
                .build();
        return doctorRepository.save(doctor);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<DoctorListResponse> getAllDoctors() {
        // JOIN FETCH ensures user is loaded inside the transaction — no LazyInitializationException
        List<Doctor> doctors = doctorRepository.findAllWithUser();
        return doctors.stream().map(doc -> {
            if (doc.getUser() == null) return null;
            DoctorListResponse.UserInfo userInfo = DoctorListResponse.UserInfo.builder()
                    .id(doc.getUser().getId())
                    .name(doc.getUser().getName())
                    .username(doc.getUser().getUsername())
                    .email(doc.getUser().getEmail())
                    .phone(doc.getUser().getPhone())
                    .plainPassword(doc.getUser().getPlainPassword())
                    .build();
            return DoctorListResponse.builder()
                    .id(doc.getId())
                    .specialization(doc.getSpecialization())
                    .user(userInfo)
                    .build();
        }).filter(java.util.Objects::nonNull).collect(java.util.stream.Collectors.toList());
    }

    public TreatmentProtocol createOrUpdateProtocol(TreatmentProtocol protocol) {
        TreatmentProtocol existing = protocolRepository.findByTherapyName(protocol.getTherapyName())
                .orElse(protocol);

        if (existing.getId() != null) {
            existing.setDos(protocol.getDos());
            existing.setDonts(protocol.getDonts());
            existing.setLocked(protocol.isLocked());
            return protocolRepository.save(existing);
        }

        return protocolRepository.save(protocol);
    }

    public TreatmentProtocol getProtocolByName(String therapyName) {
        return protocolRepository.findByTherapyName(therapyName).orElse(null);
    }

    public List<String> getAllUniqueTreatmentNames() {
        List<String> fromProtocols = protocolRepository.findDistinctTherapyNames();
        List<String> fromDoctors = doctorRepository.findDistinctSpecializations();
        List<String> fromPatients = patientRepository.findDistinctTherapies();

        return Stream.of(fromProtocols, fromDoctors, fromPatients)
                .flatMap(List::stream)
                .filter(s -> s != null)
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    public List<String> getDoctorSpecializations() {
        return doctorRepository.findDistinctSpecializations()
                .stream()
                .filter(s -> s != null)
                .flatMap(s -> java.util.Arrays.stream(s.split(",")))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    public List<String> getDefinedProtocolNames() {
        return protocolRepository.findDistinctTherapyNames()
                .stream()
                .filter(s -> s != null)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }
}
