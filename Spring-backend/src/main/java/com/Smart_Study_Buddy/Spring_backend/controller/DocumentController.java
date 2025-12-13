package com.Smart_Study_Buddy.Spring_backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Smart_Study_Buddy.Spring_backend.dto.DocumentResponse;
import com.Smart_Study_Buddy.Spring_backend.service.FirebaseStorageService;
import com.Smart_Study_Buddy.Spring_backend.service.FirestoreService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final FirebaseStorageService storageService;
    private final FirestoreService firestoreService;

    public DocumentController(FirebaseStorageService storageService, FirestoreService firestoreService) {
        this.storageService = storageService;
        this.firestoreService = firestoreService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            if (!file.getContentType().equals("application/pdf")) {
                return ResponseEntity.badRequest().body("Only PDF files are allowed");
            }

            String storagePath = storageService.uploadFile(file, userId);
            String downloadUrl = storageService.getDownloadUrl(storagePath);

            String docId = firestoreService.saveDocument(userId, file.getOriginalFilename(), storagePath, downloadUrl);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "documentId", docId,
                    "downloadUrl", downloadUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Upload faild: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserDocuments(@RequestParam("userId") String userId) {
        try {
            List<Map<String, Object>> docs = firestoreService.getUserDocuments(userId);

            List<DocumentResponse> responses = new ArrayList<>();
            for (Map<String, Object> doc : docs) {
                responses.add(new DocumentResponse(
                        (String) doc.get("id"),
                        (String) doc.get("fileName"),
                        (String) doc.get("downloadUrl"),
                        (java.util.Date) doc.get("uploadedAt")));
            }
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to fetch documents: " + e.getMessage());
        }
    }

}
