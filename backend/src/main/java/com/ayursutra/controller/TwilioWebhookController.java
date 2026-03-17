package com.ayursutra.controller;

import com.ayursutra.model.HealthReport;
import com.ayursutra.model.Patient;
import com.ayursutra.model.Patient.CallStatus;
import com.ayursutra.repository.HealthReportRepository;
import com.ayursutra.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/twilio")
@RequiredArgsConstructor
public class TwilioWebhookController {

    private final PatientRepository patientRepository;
    private final HealthReportRepository healthReportRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    // ── 1. Call-Status Webhook (existing) ─────────────────────────────────────

    @PostMapping("/call-status")
    public ResponseEntity<?> handleCallStatus(
            @RequestParam Map<String, String> payload,
            @RequestParam(value = "CallStatus", required = false) String callStatus,
            @RequestParam(value = "To", required = false) String to) {

        System.out.println("[TwilioWebhook] Received status update: " + callStatus + " for " + to);

        if (callStatus == null || to == null) {
            return ResponseEntity.badRequest().build();
        }

        String phoneFilter = to.startsWith("+91") ? to.substring(3) : to;

        try {
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

    // ── 2. Gather-Response Webhook (NEW) — receives patient's spoken health reply ──

    /**
     * Twilio POSTs here after the patient speaks into the phone.
     * We receive the speech transcript, ask Gemini to analyse it,
     * save a HealthReport, and return a TwiML thank-you message.
     */
    @PostMapping(value = "/gather-response", produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> handleGatherResponse(
            @RequestParam(value = "SpeechResult", required = false) String speechResult,
            @RequestParam(value = "To", required = false) String to,
            @RequestParam(value = "From", required = false) String from) {

        System.out.println("[TwilioWebhook] Gather response received.");
        System.out.println("[TwilioWebhook] SpeechResult: " + speechResult);
        System.out.println("[TwilioWebhook] To: " + to);

        String thankYouTwiml = "<Response><Say language=\"en-IN\">"
                + "Thank you for sharing. We have recorded your response. "
                + "Your doctor will review it shortly. Have a good day. Goodbye."
                + "</Say></Response>";

        if (speechResult == null || speechResult.isBlank() || to == null) {
            return ResponseEntity.ok(thankYouTwiml);
        }

        try {
            // Find patient by called phone number (pick the most recently added one if phones are duplicated in testing)
            String phoneFilter = to.startsWith("+91") ? to.substring(3) : to;
            Patient patient = patientRepository.findAll().stream()
                    .filter(p -> p.getUser() != null
                            && p.getUser().getPhone() != null
                            && p.getUser().getPhone().endsWith(phoneFilter))
                    .max((p1, p2) -> p1.getId().compareTo(p2.getId()))
                    .orElse(null);

            if (patient == null) {
                System.err.println("[TwilioWebhook] No patient found for phone: " + to);
                return ResponseEntity.ok(thankYouTwiml);
            }

            String patientName = patient.getUser().getName();
            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "Ayurvedic";

            System.out.println("[TwilioWebhook] Calling Gemini AI for: " + patientName);
            // Ask Gemini to generate a structured health report
            String aiSummary = generateAiSummary(patientName, therapy, speechResult);
            System.out.println("[TwilioWebhook] Gemini AI summary generated successfully");

            // Save the health report
            HealthReport report = HealthReport.builder()
                    .patientId(patient.getId())
                    .patientName(patientName)
                    .therapyName(therapy)
                    .transcription(speechResult)
                    .aiSummary(aiSummary)
                    .reportDate(LocalDate.now())
                    .build();
            healthReportRepository.save(report);

            System.out.println("[TwilioWebhook] Health report saved for patient: " + patientName);

        } catch (Exception e) {
            System.err.println("[TwilioWebhook] CRITICAL ERROR saving health report:");
            e.printStackTrace();
        }

        return ResponseEntity.ok(thankYouTwiml);
    }

    // ── Gemini helper ─────────────────────────────────────────────────────────

    private String generateAiSummary(String patientName, String therapy, String transcript) {
        try {
            // Pre-process transcript to avoid breaking JSON (remove quotes and new lines)
            String safeTranscript = transcript.replace("\n", " ").replace("\"", "'").replace("\\", "");
            
            String prompt = String.format(
                    "You are an Ayurvedic health assistant. A patient named %s undergoing %s therapy " +
                    "said the following during a health check call:\n\n'%s'\n\n" +
                    "Write a concise structured health report with:\n" +
                    "1. Reported Symptoms\n" +
                    "2. Severity Assessment (Mild / Moderate / Severe)\n" +
                    "3. Recommended Action for Doctor\n" +
                    "Keep it under 200 words.",
                    patientName, therapy, safeTranscript);

            RestTemplate rest = new RestTemplate();
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> body = Map.of("contents", List.of(content));

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<Map<String, Object>> requestEntity = new org.springframework.http.HttpEntity<>(body, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = rest.postForObject(url, requestEntity, Map.class);

            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                return (String) parts.get(0).get("text");
            }
        } catch (Exception e) {
            System.err.println("[TwilioWebhook] Gemini AI summary failed: " + e.getMessage());
        }
        return "AI summary could not be generated. Raw transcript: " + transcript;
    }
}
