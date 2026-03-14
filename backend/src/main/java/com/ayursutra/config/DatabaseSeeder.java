package com.ayursutra.config;

import com.ayursutra.model.Role;
import com.ayursutra.model.User;
import com.ayursutra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@ayursutra.com")
                    .name("System Administrator")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Default Admin seeded successfully: admin / admin123");
        }
    }
}
