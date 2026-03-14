package com.ayursutra.dto;

import lombok.Data;

@Data
public class DoctorSignupRequest {
    private String email;
    private String name;
    private String specialization;
    private String phone;
}
