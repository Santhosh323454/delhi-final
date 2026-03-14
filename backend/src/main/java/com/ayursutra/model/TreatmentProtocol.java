package com.ayursutra.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "treatment_protocols")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentProtocol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String therapyName; // e.g., "Vamana"

    @Column(columnDefinition = "TEXT")
    private String dos; // Enna pannanum

    @Column(columnDefinition = "TEXT")
    private String donts; // Enna panna kudadhu

    private LocalDateTime lastUpdated;

    private boolean isLocked; // Admin control lock

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }
}
