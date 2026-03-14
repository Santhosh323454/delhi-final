package com.ayursutra.dto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String identifier; // phone or username
    private String otp;
}
