package com.ayursutra.repository;

import com.ayursutra.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserId(Long userId);
    Optional<Doctor> findByUserUsername(String username);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.specialization IS NOT NULL AND d.specialization != ''")
    List<String> findDistinctSpecializations();
}
