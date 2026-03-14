package com.ayursutra.controller;

import com.ayursutra.model.TreatmentProtocol;
import com.ayursutra.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/protocols")
@RequiredArgsConstructor
public class ProtocolController {

    private final AdminService adminService;

    @GetMapping("/names")
    public ResponseEntity<List<String>> getAllUniqueTreatmentNames() {
        return ResponseEntity.ok(adminService.getAllUniqueTreatmentNames());
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> getDefinedProtocolNames() {
        return ResponseEntity.ok(adminService.getDefinedProtocolNames());
    }

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getDoctorSpecializations() {
        return ResponseEntity.ok(adminService.getDoctorSpecializations());
    }

    @PostMapping("/save")
    public ResponseEntity<TreatmentProtocol> saveProtocol(@RequestBody TreatmentProtocol protocol) {
        return ResponseEntity.ok(adminService.createOrUpdateProtocol(protocol));
    }

    @GetMapping("/{therapyName}")
    public ResponseEntity<TreatmentProtocol> getProtocol(@PathVariable String therapyName) {
        TreatmentProtocol protocol = adminService.getProtocolByName(therapyName);
        if (protocol != null) {
            return ResponseEntity.ok(protocol);
        }
        return ResponseEntity.notFound().build();
    }
}
