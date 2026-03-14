package com.ayursutra.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String patientUsername; // e.g. "AS-2026-002"
    private String message;
    private String language; // "English" or "Tamil"
}
