package com.ayursutra.controller;

import com.ayursutra.dto.TreatmentRecordRequest;
import com.ayursutra.dto.TreatmentRecordResponse;
import com.ayursutra.model.Doctor;
import com.ayursutra.model.Patient;
import com.ayursutra.model.TreatmentRecord;
import com.ayursutra.repository.DoctorRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.TreatmentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/treatments")
@RequiredArgsConstructor
public class TreatmentController {

    private final TreatmentRecordRepository treatmentRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping
    public ResponseEntity<?> addTreatmentRecord(@RequestBody TreatmentRecordRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Doctor doctor = doctorRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Doctor not found for current user"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        TreatmentRecord record = TreatmentRecord.builder()
                .patient(patient)
                .doctor(doctor)
                .treatmentMethod(request.getTreatmentMethod())
                .medicines(request.getMedicines())
                .notes(request.getNotes())
                .build();

        TreatmentRecord savedRecord = treatmentRecordRepository.save(record);
        return ResponseEntity.ok(TreatmentRecordResponse.fromEntity(savedRecord));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentRecordResponse>> getPatientHistory(@PathVariable Long patientId) {
        List<TreatmentRecord> history = treatmentRecordRepository.findByPatientIdOrderByVisitDateDesc(patientId);
        List<TreatmentRecordResponse> responses = history.stream()
                .map(TreatmentRecordResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
