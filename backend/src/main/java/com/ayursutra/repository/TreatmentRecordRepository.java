package com.ayursutra.repository;

import com.ayursutra.model.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {
    List<TreatmentRecord> findByPatientIdOrderByVisitDateDesc(Long patientId);
}
