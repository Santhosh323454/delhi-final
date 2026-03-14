package com.ayursutra.controller;

import com.ayursutra.dto.DoctorSignupRequest;
import com.ayursutra.model.Doctor;
import com.ayursutra.model.TreatmentProtocol;
import com.ayursutra.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> addDoctor(@RequestBody DoctorSignupRequest request) {
        return ResponseEntity.ok(adminService.addDoctor(request));
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    @PostMapping("/protocols")
    public ResponseEntity<TreatmentProtocol> updateProtocol(@RequestBody TreatmentProtocol protocol) {
        return ResponseEntity.ok(adminService.createOrUpdateProtocol(protocol));
    }
}
