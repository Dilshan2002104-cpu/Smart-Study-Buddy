package com.Smart_Study_Buddy.Spring_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Smart_Study_Buddy.Spring_backend.dto.AuthResponse;
import com.Smart_Study_Buddy.Spring_backend.dto.LoginRequest;
import com.Smart_Study_Buddy.Spring_backend.dto.RegisterRequest;
import com.Smart_Study_Buddy.Spring_backend.service.FirebaseAuthService;
import com.google.firebase.auth.UserRecord;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final FirebaseAuthService authService;

    public AuthController(FirebaseAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserRecord user = authService.createUser(
                    request.getEmail(),
                    request.getPassword(),
                    request.getUsername());

            String customToken = authService.createCustomerToken(user.getUid());

            AuthResponse response = new AuthResponse(
                    user.getUid(),
                    user.getDisplayName(),
                    user.getEmail(),
                    customToken);
            response.setMessage("User registered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request){
        try {
            UserRecord user = authService.getUserByEmail(request.getEmail());
            String customToken = authService.createCustomerToken(user.getUid());

            AuthResponse response = new AuthResponse(
                user.getUid(),
                user.getDisplayName(),
                user.getEmail(),
                customToken
            );
            response.setMessage("Login successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Login faild: " + e.getMessage());
        }
    }
}
