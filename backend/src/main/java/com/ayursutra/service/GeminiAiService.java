package com.ayursutra.service;

import com.ayursutra.model.TreatmentProtocol;
import com.ayursutra.repository.TreatmentProtocolRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GeminiAiService {

    private final TreatmentProtocolRepository protocolRepository;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    public String askGemini(String userQuestion, String treatmentName) {

        // ── Step 1: Fetch Admin-defined protocols from DB ─────────────────────
        Optional<TreatmentProtocol> protocolOpt = protocolRepository.findByTherapyName(treatmentName);
        String dos   = "Follow standard clinical rest and light meals.";
        String donts = "Avoid heavy activities, cold food, and alcohol.";

        if (protocolOpt.isPresent()) {
            TreatmentProtocol p = protocolOpt.get();
            if (p.getDos()   != null && !p.getDos().isBlank())   dos   = p.getDos();
            if (p.getDonts() != null && !p.getDonts().isBlank()) donts = p.getDonts();
        }

        // ── Step 2: Build strict fallback (ONLY used when API fails) ──────────
        String fallbackResponse = String.format(
                "Based on your %s protocol:\n\n✅ DO: %s\n\n❌ DON'T: %s\n\nPlease follow these carefully.",
                treatmentName, dos, donts);

        // ── Step 3: Guard — no key, return fallback immediately ───────────────
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_GEMINI")) {
            System.err.println("[GeminiAiService] No API key configured. Returning DB fallback.");
            return fallbackResponse;
        }

        // ── Step 4: Build an intelligent RAG prompt ───────────────────────────
        // We embed the protocol DATA inside the prompt so Gemini reasons about it.
        String intelligentPrompt = String.format(
                "You are AyurMitra, a friendly Ayurvedic assistant.\n\n" +
                "The patient is undergoing \"%s\" therapy.\n\n" +
                "Here is the patient's official treatment protocol from the doctor:\n" +
                "  ✅ WHAT TO DO: %s\n" +
                "  ❌ WHAT NOT TO DO: %s\n\n" +
                "The patient is now asking: \"%s\"\n\n" +
                "Instructions for your reply:\n" +
                "1. Use ONLY the protocol information above to answer. Do NOT add outside knowledge.\n" +
                "2. If the patient asks about a specific food or activity (e.g., 'Can I eat Biryani?'), reason about it: " +
                "   check if it violates the Don'ts and explain clearly WHY it is or isn't allowed.\n" +
                "3. Give a warm, natural, conversational answer — NOT a bullet list dump.\n" +
                "4. Reply in the SAME language the patient used (Tamil, Hindi, or English).\n" +
                "5. If the question has nothing to do with the therapy, say: 'Please consult your doctor for that.'\n" +
                "6. Keep the answer under 3 sentences. No markdown, no ** or ## symbols.",
                treatmentName, dos, donts, userQuestion
        );

        System.out.println("[GeminiAiService] Sending intelligent RAG prompt for: " + treatmentName);
        System.out.println("[GeminiAiService] Patient question: " + userQuestion);

        // ── Step 5: Call Gemini API ───────────────────────────────────────────
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Use Jackson to correctly escape the prompt (handles quotes, newlines etc.)
            ObjectMapper mapper = new ObjectMapper();
            String safePrompt = mapper.writeValueAsString(intelligentPrompt);
            String requestBody = "{\"contents\": [{\"parts\":[{\"text\": " + safePrompt + "}]}]}";

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    apiUrl + "?key=" + apiKey, entity, String.class);

            System.out.println("[GeminiAiService] HTTP Status: " + response.getStatusCode());

            JsonNode root = mapper.readTree(response.getBody());

            // Check for Gemini-level error block
            JsonNode errorNode = root.path("error");
            if (!errorNode.isMissingNode()) {
                String errMsg = errorNode.path("message").asText("Gemini API error");
                System.err.println("[GeminiAiService] Gemini error: " + errMsg);
                return fallbackResponse; // API error → use DB fallback
            }

            // Extract the text from the response
            JsonNode candidates = root.path("candidates");
            if (candidates.isMissingNode() || !candidates.isArray() || candidates.size() == 0) {
                System.err.println("[GeminiAiService] No candidates returned.");
                return fallbackResponse;
            }

            String aiText = candidates.get(0)
                    .path("content").path("parts").get(0).path("text").asText("").trim();

            System.out.println("[GeminiAiService] AI Response: " + aiText.substring(0, Math.min(100, aiText.length())));

            // Only fall back if Gemini returned blank text
            return aiText.isBlank() ? fallbackResponse : aiText;

        } catch (Exception e) {
            // ── THIS is the ONLY place fallback is triggered on real failures ──
            System.err.println("[GeminiAiService] API call failed: " + e.getMessage());
            return fallbackResponse;
        }
    }
}