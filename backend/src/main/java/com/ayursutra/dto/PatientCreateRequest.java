package com.ayursutra.dto;

import lombok.Data;

@Data
public class PatientCreateRequest {
    private String name;
    private String email;
    private String currentTherapy;
    private String phone;
    private String prakriti;
}

