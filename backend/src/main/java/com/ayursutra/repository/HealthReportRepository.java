package com.ayursutra.repository;

import com.ayursutra.model.HealthReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthReportRepository extends JpaRepository<HealthReport, Long> {

    /** Most-recent report first */
    List<HealthReport> findByPatientIdOrderByReportDateDesc(Long patientId);

    /** Convenience: grab only the latest report for a patient */
    Optional<HealthReport> findTopByPatientIdOrderByReportDateDesc(Long patientId);
}
