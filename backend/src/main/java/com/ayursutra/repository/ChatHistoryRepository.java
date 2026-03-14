package com.ayursutra.repository;

import com.ayursutra.model.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByPatientIdOrderByTimestampAsc(Long patientId);
}
