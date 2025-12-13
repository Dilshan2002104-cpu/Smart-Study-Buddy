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
}
