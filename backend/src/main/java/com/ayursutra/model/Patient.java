package com.ayursutra.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    // ──────────────────────────────────────────────────────────────────────────
    // Enum to track the daily voice-call reminder status
    // ──────────────────────────────────────────────────────────────────────────
    public enum CallStatus {
        PENDING,    // No call made yet (or reset at start of day)
        ANSWERED,   // Patient picked up the call
        MISSED      // All attempts done; patient did not answer
    }
    // ──────────────────────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Doctor doctor;

    private String currentTherapy;
    private Integer recoveryProgress;
    private String status;

    @Column(columnDefinition = "TEXT")
    private String customNotes;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Schedule> schedules;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<PatientFeedback> feedbackList;

    private LocalDateTime createdAt;

    // ── Treatment Plan Fields ─────────────────────────────────────────────────
    /** Total therapy duration in days (e.g. 30, 60, 90). Set by doctor. */
    @Column(name = "total_duration")
    private Integer totalDuration;

    /** How often the patient must visit for a checkup (every X days). */
    @Column(name = "interval_days")
    private Integer intervalDays;

    /** Date of the next scheduled checkup. Auto-advanced after each answered call. */
    @Column(name = "next_checkup_date")
    private LocalDate nextCheckupDate;

    /** Plan expiry date = plan-start-date + totalDuration days. */
    @Column(name = "end_date")
    private LocalDate endDate;
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Tracks the outcome of today's voice-call reminder cycle.
     * Defaults to PENDING so every patient gets called at 6 PM.
     * Set to ANSWERED when a call is picked up; MISSED after the 8 PM attempt.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "call_status", nullable = false)
    @Builder.Default
    private CallStatus callStatus = CallStatus.PENDING;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.callStatus == null) {
            this.callStatus = CallStatus.PENDING;
        }
    }
}
