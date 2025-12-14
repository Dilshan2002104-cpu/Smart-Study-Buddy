package com.Smart_Study_Buddy.Spring_backend.controller;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:5173")
public class PdfController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String AI_SERVICE_URL = "http://localhost:8000/api/ai";

    @PostMapping("/extract-from-storage-path")
    public ResponseEntity<?> extractTextFromStoragePath(@RequestBody Map<String, String> request) {
        try {
            String storagePath = request.get("storagePath");
            System.out.println("Downloading PDF from Firebase Storage: " + storagePath);

            // Download PDF directly from Firebase Storage using Admin SDK
            Bucket bucket = StorageClient.getInstance().bucket();
            Blob blob = bucket.get(storagePath);

            if (blob == null || !blob.exists()) {
                return ResponseEntity.status(404).body(Map.of("error", "File not found in storage"));
            }

            byte[] pdfBytes = blob.getContent();
            System.out.println("PDF downloaded successfully, size: " + pdfBytes.length + " bytes");

            // Prepare multipart request to Python service
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(pdfBytes) {
                @Override
                public String getFilename() {
                    return "document.pdf";
                }
            });

            HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

            System.out.println("Sending PDF to Python service for text extraction...");
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    AI_SERVICE_URL + "/extract-text",
                    entity,
                    Map.class);

            System.out.println("Text extraction successful!");
            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getName());
            return ResponseEntity.status(500).body(error);
        }
    }
}
