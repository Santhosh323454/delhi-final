package com.ayursutra.dto;

import lombok.Data;

@Data
public class TreatmentRecordRequest {
    private Long patientId;
    private String treatmentMethod;
    private String medicines;
    private String notes;
}
