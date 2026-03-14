package com.ayursutra.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Patient patient;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
