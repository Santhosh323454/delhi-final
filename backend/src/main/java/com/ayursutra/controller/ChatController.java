package com.ayursutra.controller;

import com.ayursutra.dto.ChatRequest;
import com.ayursutra.dto.ChatResponse;
import com.ayursutra.model.Patient;
import com.ayursutra.model.ChatHistory;
import com.ayursutra.repository.ChatHistoryRepository;
import com.ayursutra.repository.PatientRepository;
import com.ayursutra.repository.UserRepository;
import com.ayursutra.service.GeminiAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiAiService geminiAiService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(@RequestBody ChatRequest request) {
        try {
            // Look up patient by username (e.g. "AS-2026-002")
            Patient patient = userRepository.findByUsername(request.getPatientUsername())
                    .flatMap(user -> patientRepository.findByUserId(user.getId()))
                    .orElseThrow(() -> new RuntimeException(
                            "Patient not found for username: " + request.getPatientUsername()));

            String therapy = patient.getCurrentTherapy() != null ? patient.getCurrentTherapy() : "General Ayurveda";

            System.out.println("[ChatController] Patient: " + patient.getUser().getName()
                    + " | Therapy: " + therapy + " | Question: " + request.getMessage());

            String aiResponse = geminiAiService.askGemini(request.getMessage(), therapy);

            // Save chat history
            ChatHistory history = ChatHistory.builder()
                    .patient(patient)
                    .message(request.getMessage())
                    .response(aiResponse)
                    .build();
            chatHistoryRepository.save(history);

            return ResponseEntity.ok(ChatResponse.builder().reply(aiResponse).build());

        } catch (Exception e) {
            System.err.println("[ChatController] Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
