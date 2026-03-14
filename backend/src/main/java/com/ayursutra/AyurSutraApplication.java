package com.ayursutra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class AyurSutraApplication {

    public static void main(String[] args) {
        // Load .env file and inject into system properties for Spring to resolve ${} placeholders
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .ignoreIfMalformed()
                    .load();
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            System.out.println("====== SYSTEM: LOADED .ENV SECRETS ======");
        } catch (Exception e) {
            System.err.println("====== SYSTEM: FAILED TO LOAD .ENV FILE: " + e.getMessage() + " ======");
        }

        SpringApplication.run(AyurSutraApplication.class, args);
    }

    @Bean
    public CommandLineRunner cleanUp(com.ayursutra.repository.UserRepository userRepository,
            com.ayursutra.repository.DoctorRepository doctorRepository,
            com.ayursutra.repository.PatientRepository patientRepository,
            com.ayursutra.repository.ChatHistoryRepository chatHistoryRepository) {
        return args -> {
            System.out.println("====== SYSTEM: STARTING WITH PERSISTENT DATA (DATA SAFE) ======");
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            // Seed default ADMIN user if not exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                com.ayursutra.model.User adminUser = com.ayursutra.model.User.builder()
                        .username("admin")
                        .password(encoder.encode("admin123"))
                        .name("System Administrator")
                        .email("admin@ayursutra.com")
                        .phone("9999999999")
                        .role(com.ayursutra.model.Role.ADMIN)
                        .build();
                userRepository.save(adminUser);
                System.out.println("====== SYSTEM: SEEDED DEFAULT ADMIN (admin / admin123) ======");
            } else {
                // Update admin password to ensure it is correct
                userRepository.findByUsername("admin").ifPresent(a -> {
                    a.setPassword(encoder.encode("admin123"));
                    a.setRole(com.ayursutra.model.Role.ADMIN);
                    userRepository.save(a);
                });
                System.out.println("====== SYSTEM: ADMIN EXISTS, PASSWORD RESET ======");
            }

            // Check if default doctor already exists to avoid duplicate entry errors
            if (userRepository.findByUsername("doctor1").isEmpty()) {
                com.ayursutra.model.User docUser = com.ayursutra.model.User.builder()
                        .username("doctor1")
                        .password(encoder.encode("doctor123"))
                        .name("Dr. Default")
                        .email("doc1@example.com")
                        .phone("1234567890")
                        .role(com.ayursutra.model.Role.DOCTOR)
                        .build();
                userRepository.save(docUser);

                com.ayursutra.model.Doctor doctor = com.ayursutra.model.Doctor.builder()
                        .user(docUser)
                        .specialization("General Ayurveda")
                        .build();
                doctorRepository.save(doctor);
                System.out.println("====== SYSTEM: SEEDED DEFAULT DOCTOR (doctor1) ======");
            } else {
                System.out.println("====== SYSTEM: DEFAULT DOCTOR ALREADY EXISTS ======");
            }
        };
    }
}