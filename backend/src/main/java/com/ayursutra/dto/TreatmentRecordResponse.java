package com.ayursutra.dto;

import com.ayursutra.model.TreatmentRecord;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TreatmentRecordResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime visitDate;
    private String treatmentMethod;
    private String medicines;
    private String notes;

    public static TreatmentRecordResponse fromEntity(TreatmentRecord record) {
        TreatmentRecordResponse response = new TreatmentRecordResponse();
        response.setId(record.getId());
        response.setPatientId(record.getPatient().getId());
        response.setDoctorId(record.getDoctor().getId());
        response.setDoctorName(record.getDoctor().getUser().getName());
        response.setVisitDate(record.getVisitDate());
        response.setTreatmentMethod(record.getTreatmentMethod());
        response.setMedicines(record.getMedicines());
        response.setNotes(record.getNotes());
        return response;
    }
}
