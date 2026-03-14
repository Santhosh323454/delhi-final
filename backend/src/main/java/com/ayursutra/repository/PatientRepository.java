package com.ayursutra.repository;

import com.ayursutra.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(Long userId);

    @Query("SELECT DISTINCT p.currentTherapy FROM Patient p WHERE p.currentTherapy IS NOT NULL AND p.currentTherapy != ''")
    List<String> findDistinctTherapies();
}
