package com.ayursutra.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;

    @Column(name = "treatment_method", columnDefinition = "TEXT")
    private String treatmentMethod;

    @Column(columnDefinition = "TEXT")
    private String medicines;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (visitDate == null) {
            visitDate = LocalDateTime.now();
        }
    }
}
