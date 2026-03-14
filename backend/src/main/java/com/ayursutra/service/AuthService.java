package com.ayursutra.service;

import com.ayursutra.dto.AdminSignupRequest;
import com.ayursutra.dto.AuthRequest;
import com.ayursutra.dto.AuthResponse;
import com.ayursutra.model.Role;
import com.ayursutra.model.User;
import com.ayursutra.repository.UserRepository;
import com.ayursutra.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private static final String ADMIN_SECRET = "ADMIN777";

    public AuthResponse registerAdmin(AdminSignupRequest request) {
        if (!ADMIN_SECRET.equals(request.getSecretCode())) {
            throw new RuntimeException("Invalid Admin Secret Code");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                // Assuming phone comes in username or we can just save it later
                .phone(request.getUsername()) // Demo fallback
                .role(Role.ADMIN)
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("Admin registered successfully")
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }
}
