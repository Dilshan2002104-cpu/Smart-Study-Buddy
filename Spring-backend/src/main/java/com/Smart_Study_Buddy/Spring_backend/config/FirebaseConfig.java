package com.Smart_Study_Buddy.Spring_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-key}")
    private Resource serviceAccountKey;

    @Value("${firebase.storage-bucket}")
    private String storageBucket;

    @PostConstruct
    public void initialize() throws IOException {
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(
                        serviceAccountKey.getInputStream()))
                .setStorageBucket(storageBucket)
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}