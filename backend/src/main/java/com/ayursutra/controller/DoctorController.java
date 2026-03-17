package com.ayursutra.controller;

import com.ayursutra.dto.PatientCreateRequest;
import com.ayursutra.dto.PatientResponse;
import com.ayursutra.model.Patient;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.service.AIVoiceService;
import com.ayursutra.service.DoctorService;
import com.ayursutra.model.HealthReport;
import com.ayursutra.repository.HealthReportRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
// CORS is handled globally in SecurityConfig.java
public class DoctorController {

    private final DoctorService doctorService;
    private final PatientRepository patientRepository;
    private final AIVoiceService aiVoiceService;
    private final HealthReportRepository healthReportRepository;

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getSpecializations() {
        return ResponseEntity.ok(doctorService.getSpecializations());
    }

    @PostMapping("/add-patient")
    public ResponseEntity<?> addPatient(
            Authentication authentication,
            @RequestBody PatientCreateRequest request) {
        try {
            String username = (authentication != null && authentication.getName() != null)
                    ? authentication.getName()
                    : "doctor1";
            PatientResponse response = doctorService.addPatient(username, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Failed to add patient"));
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getMyPatients(Authentication authentication) {
        String username = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "doctor1";
        return ResponseEntity.ok(doctorService.getMyPatients(username));
    }

    @PostMapping("/trigger-call/{patientId}")
    public ResponseEntity<?> triggerCall(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            String phone = patient.getUser() != null ? patient.getUser().getPhone() : null;
            String name = patient.getUser() != null ? patient.getUser().getName() : "Patient";
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Consultation";

            System.out.println("[TriggerCall] AI Health Interview call to: " + name + " | Phone: " + phone);

            aiVoiceService.makeVoiceCall(phone, name, therapy);
            return ResponseEntity.ok(Map.of("message", "AI Health Interview Call Triggered Successfully!"));
        } catch (Exception e) {
            System.err.println("[TriggerCall] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/trigger-reminder/{patientId}")
    public ResponseEntity<?> triggerReminder(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            String phone = patient.getUser() != null ? patient.getUser().getPhone() : null;
            String name = patient.getUser() != null ? patient.getUser().getName() : "Patient";
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";

            System.out.println("[TriggerReminder] Treatment reminder call to: " + name + " | Phone: " + phone);

            aiVoiceService.makeReminderCall(phone, name, therapy);
            return ResponseEntity.ok(Map.of("message", "Treatment Reminder Call Triggered!"));
        } catch (Exception e) {
            System.err.println("[TriggerReminder] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<?> deletePatient(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));
            patientRepository.delete(patient);
            return ResponseEntity.ok(Map.of("message", "Patient deleted successfully"));
        } catch (Exception e) {
            System.err.println("[DeletePatient] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to delete patient"));
        }
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<?> updatePatient(@PathVariable Long patientId, @RequestBody Map<String, Object> updates) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            // 🛠️ Manual null checks and casting
            if (updates.containsKey("currentTherapy")) {
                patient.setCurrentTherapy((String) updates.get("currentTherapy"));
            }

            // Note: Make sure 'status' field exists in your Patient.java model
            if (updates.containsKey("status")) {
                patient.setStatus((String) updates.get("status"));
            }

            if (updates.containsKey("recoveryProgress")) {
                Object progress = updates.get("recoveryProgress");
                if (progress instanceof Integer) {
                    patient.setRecoveryProgress((Integer) progress);
                } else if (progress instanceof String) {
                    patient.setRecoveryProgress(Integer.parseInt((String) progress));
                }
            }

            if (patient.getUser() != null) {
                if (updates.containsKey("name")) {
                    patient.getUser().setName((String) updates.get("name"));
                }
                if (updates.containsKey("phone")) {
                    patient.getUser().setPhone((String) updates.get("phone"));
                }
            }

            patientRepository.save(patient);
            return ResponseEntity.ok(Map.of("message", "Patient updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Failed to update patient"));
        }
    }

    /**
     * POST /api/doctor/save-plan/{patientId}
     * Body: { "totalDuration": 30, "intervalDays": 7 }
     *
     * Calculates:
     *   endDate          = today + totalDuration  days
     *   nextCheckupDate  = today + intervalDays   days
     */
    @PostMapping("/save-plan/{patientId}")
    public ResponseEntity<?> saveTreatmentPlan(
            @PathVariable Long patientId,
            @RequestBody Map<String, Object> body) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            int totalDuration = Integer.parseInt(body.get("totalDuration").toString());
            int intervalDays  = Integer.parseInt(body.get("intervalDays").toString());

            LocalDate today = LocalDate.now();
            patient.setTotalDuration(totalDuration);
            patient.setIntervalDays(intervalDays);
            patient.setEndDate(today.plusDays(totalDuration));
            patient.setNextCheckupDate(today.plusDays(intervalDays));

            patientRepository.save(patient);
            return ResponseEntity.ok(Map.of(
                    "message",         "Treatment plan saved!",
                    "nextCheckupDate", patient.getNextCheckupDate().toString(),
                    "endDate",         patient.getEndDate().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to save plan: " + e.getMessage()));
        }
    }

    @GetMapping("/patients/{patientId}/health-report/pdf")
    public ResponseEntity<byte[]> downloadHealthReportPdf(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient not found"));

            HealthReport report = healthReportRepository.findTopByPatientIdOrderByReportDateDesc(patientId)
                    .orElseThrow(() -> new RuntimeException("No health report found for this patient. Please ensure a call has been completed."));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Add Header
            document.add(new Paragraph("AyurSutra Health Report")
                    .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER));
            
            document.add(new Paragraph(" "));

            // Add Patient Details
            document.add(new Paragraph("Patient Name: " + report.getPatientName()).setBold());
            document.add(new Paragraph("Report Date: " + report.getReportDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy"))));
            document.add(new Paragraph("Therapy: " + (report.getTherapyName() != null ? report.getTherapyName() : "N/A")));

            document.add(new Paragraph(" "));

            // Add Transcript
            document.add(new Paragraph("Patient's Spoken Update:").setBold().setFontSize(14));
            document.add(new Paragraph(report.getTranscription()));

            document.add(new Paragraph(" "));

            // Add AI Summary
            document.add(new Paragraph("AI Health Summary:").setBold().setFontSize(14));
            document.add(new Paragraph(report.getAiSummary()));

            document.close();

            byte[] pdfBytes = baos.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "HealthReport_" + patient.getUser().getName().replaceAll("\\s+", "_") + ".pdf";
            headers.setContentDispositionFormData("filename", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("[HealthReportPDF] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}