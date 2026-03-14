package com.ayursutra.repository;

import com.ayursutra.model.TreatmentProtocol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface TreatmentProtocolRepository extends JpaRepository<TreatmentProtocol, Long> {
    Optional<TreatmentProtocol> findByTherapyName(String therapyName);

    @Query("SELECT DISTINCT t.therapyName FROM TreatmentProtocol t WHERE t.therapyName IS NOT NULL AND t.therapyName != ''")
    List<String> findDistinctTherapyNames();
}
