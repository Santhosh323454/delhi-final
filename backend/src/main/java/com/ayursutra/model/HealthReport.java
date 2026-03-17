package com.ayursutra.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stores the transcribed speech from a patient's AI health interview call
 * along with a Gemini-generated structured AI summary.
 */
@Entity
@Table(name = "health_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to the patient this report belongs to */
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** Denormalized for PDF generation without extra joins */
    @Column(name = "patient_name")
    private String patientName;

    @Column(name = "therapy_name")
    private String therapyName;

    /** Raw transcript of what the patient said during the call */
    @Column(columnDefinition = "TEXT")
    private String transcription;

    /** Gemini-generated structured health assessment */
    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    /** Date of the call / report */
    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.reportDate == null) {
            this.reportDate = LocalDate.now();
        }
    }
}
