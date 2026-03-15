package com.ayursutra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DoctorListResponse {
    private Long id;
    private String specialization;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String name;
        private String username;
        private String email;
        private String phone;
        private String plainPassword;
    }
}
