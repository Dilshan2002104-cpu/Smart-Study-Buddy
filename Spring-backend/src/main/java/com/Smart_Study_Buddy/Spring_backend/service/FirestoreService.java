package com.Smart_Study_Buddy.Spring_backend.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

import org.springframework.stereotype.Service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;

@Service
public class FirestoreService {

    private final Firestore firestore = FirestoreClient.getFirestore();

    public String saveDocument(String userId, String filename, String storagePath, String downloadUrl)
            throws ExecutionException, InterruptedException {

        Map<String, Object> docData = new HashMap<>();
        docData.put("userId", userId);
        docData.put("filename", filename);
        docData.put("storagePath", storagePath);
        docData.put("downloadUrl", downloadUrl);
        docData.put("uploadDate", new Date());

        ApiFuture<DocumentReference> future = firestore.collection("documents").add(docData);
        return future.get().getId();
    }

    public List<Map<String, Object>> getUserDocuments(String userId) throws ExecutionException, InterruptedException {

        ApiFuture<QuerySnapshot> future = firestore.collection("documents")
                .whereEqualTo("userId", userId)
                .get();

        List<Map<String, Object>> document = new ArrayList<>();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            Map<String, Object> data = doc.getData();
            if (data != null) {
                data.put("id", doc.getId());
                document.add(data);
            }
        }
        return document;
    }

    public Map<String, Object> getDocument(String documentId) throws ExecutionException, InterruptedException {
        if (documentId == null) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        DocumentSnapshot document = firestore.collection("documents").document(documentId).get().get();

        if (document.exists()) {
            Map<String, Object> data = document.getData();
            if (data != null) {
                String docId = document.getId();
                if (docId != null) {
                    data.put("id", docId);
                }
                return data;
            }
        }

        return null;
    }

    public void deleteDocument(String documentId) throws ExecutionException, InterruptedException {
        if (documentId == null) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        firestore.collection("documents").document(documentId).delete().get();
    }

    public void updateDocumentText(String documentId, String extractedText)
            throws ExecutionException, InterruptedException {
        if (documentId == null) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        Map<String, Object> updates = new HashMap<>();
        updates.put("extractedText", extractedText);
        updates.put("textExtractedAt", new Date());

        firestore.collection("documents").document(documentId).update(updates).get();
    }

    public void saveChatHistory(String documentId, String userId, List<Map<String, String>> chatHistory)
            throws ExecutionException, InterruptedException {
        Map<String, Object> chatData = new HashMap<>();
        chatData.put("documentId", documentId);
        chatData.put("userId", userId);
        chatData.put("chatHistory", chatHistory);
        chatData.put("lastUpdated", new Date());

        firestore.collection("chatHistory").document(documentId + "_" + userId).set(chatData).get();
    }

    public List<Map<String, String>> getChatHistory(String documentId, String userId)
            throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection("chatHistory")
                .document(documentId + "_" + userId)
                .get()
                .get();

        if (doc.exists() && doc.getData() != null) {
            Object chatHistoryObj = doc.getData().get("chatHistory");
            if (chatHistoryObj instanceof List) {
                return (List<Map<String, String>>) chatHistoryObj;
            }
        }
        return new ArrayList<>();
    }
}
