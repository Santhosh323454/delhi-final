package com.ayursutra.dto;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String identifier; // can be username or phone
}
