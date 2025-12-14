package com.Smart_Study_Buddy.Spring_backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
            return ResponseEntity.ok(docs);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Failed to fetch documents: " + e.getMessage());
        }
    }

    @GetMapping("/{documentId}/content")
    public ResponseEntity<?> getDocumentContent(
            @PathVariable String documentId,
            @RequestParam String userId) {
        try {
            Map<String, Object> doc = firestoreService.getDocument(documentId);

            if (doc == null) {
                return ResponseEntity.notFound().build();
            }

            String storagePath = (String) doc.get("storagePath");
            String freshDownloadUrl;

            // Fallback for old documents without storagePath
            if (storagePath == null || storagePath.isEmpty()) {
                // For old documents, just use the stored URL (may be expired)
                freshDownloadUrl = (String) doc.get("downloadUrl");
                System.out.println("Warning: Old document without storagePath, using stored URL");
            } else {
                // Generate fresh URL for new documents
                freshDownloadUrl = storageService.getDownloadUrl(storagePath);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("documentId", documentId);
            response.put("filename", doc.get("filename"));
            response.put("downloadUrl", freshDownloadUrl);
            response.put("storagePath", storagePath); // Add storagePath!

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable String documentId,
            @RequestParam String userId) {
        try {
            Map<String, Object> doc = firestoreService.getDocument(documentId);

            if (doc == null) {
                return ResponseEntity.notFound().build();
            }

            // Verify user owns the document
            if (!userId.equals(doc.get("userId"))) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            // Delete from Firestore
            firestoreService.deleteDocument(documentId);

            // Optionally delete from Storage (if you want to implement this)
            // String storagePath = (String) doc.get("storagePath");
            // if (storagePath != null) {
            // storageService.deleteFile(storagePath);
            // }

            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

}
