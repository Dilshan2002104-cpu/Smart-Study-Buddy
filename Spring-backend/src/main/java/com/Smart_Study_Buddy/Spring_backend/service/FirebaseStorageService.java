package com.Smart_Study_Buddy.Spring_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;

@Service
public class FirebaseStorageService {

    @Value("${firebase.storage-bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String userId) throws IOException {

        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String filePath = "users/" + userId + "/documents/" + filename;

        Bucket bucket = StorageClient.getInstance().bucket();
        bucket.create(filePath, file.getBytes(), file.getContentType());

        return filePath;

    }

    public String getDownloadUrl(String filePath) {
        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.get(filePath);

        return blob.signUrl(7, TimeUnit.DAYS).toString();
    }

}
