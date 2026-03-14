package com.ayursutra.dto;

import lombok.Data;

@Data
public class AdminSignupRequest {
    private String username;
    private String password;
    private String name;
    private String secretCode; // Must be ADMIN777
}
