package com.ayursutra.controller;

import com.ayursutra.dto.DoctorListResponse;
import com.ayursutra.dto.DoctorSignupRequest;
import com.ayursutra.model.Doctor;
import com.ayursutra.model.TreatmentProtocol;
import com.ayursutra.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/doctors")
    public ResponseEntity<DoctorListResponse> addDoctor(@RequestBody DoctorSignupRequest request) {
        Doctor doc = adminService.addDoctor(request);
        DoctorListResponse.UserInfo userInfo = null;
        if (doc.getUser() != null) {
            userInfo = DoctorListResponse.UserInfo.builder()
                    .id(doc.getUser().getId())
                    .name(doc.getUser().getName())
                    .username(doc.getUser().getUsername())
                    .email(doc.getUser().getEmail())
                    .phone(doc.getUser().getPhone())
                    .plainPassword(doc.getUser().getPlainPassword())
                    .build();
        }
        DoctorListResponse response = DoctorListResponse.builder()
                .id(doc.getId())
                .specialization(doc.getSpecialization())
                .user(userInfo)
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorListResponse>> getAllDoctors() {
        List<Doctor> doctors = adminService.getAllDoctors();
        List<DoctorListResponse> response = doctors.stream().map(doc -> {
            DoctorListResponse.UserInfo userInfo = null;
            if (doc.getUser() != null) {
                userInfo = DoctorListResponse.UserInfo.builder()
                        .id(doc.getUser().getId())
                        .name(doc.getUser().getName())
                        .username(doc.getUser().getUsername())
                        .email(doc.getUser().getEmail())
                        .phone(doc.getUser().getPhone())
                        .plainPassword(doc.getUser().getPlainPassword())
                        .build();
            }
            return DoctorListResponse.builder()
                    .id(doc.getId())
                    .specialization(doc.getSpecialization())
                    .user(userInfo)
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/protocols")
    public ResponseEntity<TreatmentProtocol> updateProtocol(@RequestBody TreatmentProtocol protocol) {
        return ResponseEntity.ok(adminService.createOrUpdateProtocol(protocol));
    }
}
