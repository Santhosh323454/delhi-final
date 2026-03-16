package com.ayursutra.controller;

import com.ayursutra.model.Patient;
import com.ayursutra.model.Patient.CallStatus;
import com.ayursutra.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/twilio")
@RequiredArgsConstructor
public class TwilioWebhookController {

    private final PatientRepository patientRepository;

    @PostMapping("/call-status")
    public ResponseEntity<?> handleCallStatus(
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "CallStatus", required = false) String callStatus,
            @RequestParam(value = "To", required = false) String to) {

        System.out.println("[TwilioWebhook] Received status update: " + callStatus + " for " + to);

        if (callStatus == null || to == null) {
            return ResponseEntity.badRequest().build();
        }

        // Clean up the `To` phone number to match our DB format
        // Twilio sends +91XXXXXXXXXX, our DB might store XXXXXXXXXX or +91XXXXXXXXXX
        String phoneFilter = to.startsWith("+91") ? to.substring(3) : to;

        try {
            // Find patients who have this phone number
            List<Patient> patients = patientRepository.findAll().stream()
                    .filter(p -> p.getUser() != null &&
                            p.getUser().getPhone() != null &&
                            p.getUser().getPhone().endsWith(phoneFilter))
                    .toList();

            for (Patient patient : patients) {
                if ("completed".equalsIgnoreCase(callStatus)) {
                    patient.setCallStatus(CallStatus.ANSWERED);
                    System.out.println("[TwilioWebhook] Marked patient " + patient.getUser().getName() + " as ANSWERED.");
                } else if ("no-answer".equalsIgnoreCase(callStatus) 
                        || "busy".equalsIgnoreCase(callStatus) 
                        || "failed".equalsIgnoreCase(callStatus)
                        || "canceled".equalsIgnoreCase(callStatus)) {
                    // Logic states: leave it as PENDING so retry schedules pick it up
                    System.out.println("[TwilioWebhook] Call failed/no-answer for " + patient.getUser().getName() + ". Leaving as PENDING.");
                }
                patientRepository.save(patient);
            }

            return ResponseEntity.ok("Webhook Received");
        } catch (Exception e) {
            System.err.println("[TwilioWebhook] Error processing callback: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
