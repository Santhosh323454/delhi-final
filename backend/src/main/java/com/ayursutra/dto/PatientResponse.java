package com.ayursutra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponse {
    private Long id;
    private String username; // AS-2026-XXX
    private String password; // Generated password returned once
    private String name;
    private String currentTherapy;
}
