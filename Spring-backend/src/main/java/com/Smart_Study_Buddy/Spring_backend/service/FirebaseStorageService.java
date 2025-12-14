package com.Smart_Study_Buddy.Spring_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import com.google.firebase.cloud.StorageClient;

@Service
public class FirebaseStorageService implements StorageService {

    @Value("${firebase.storage-bucket}")
    private String bucketName;

    @Override
    public String uploadFile(MultipartFile file, String storagePath) throws IOException {
        Bucket bucket = StorageClient.getInstance().bucket();
        bucket.create(storagePath, file.getBytes(), file.getContentType());

        // Generate and return a signed download URL
        Blob blob = bucket.get(storagePath);
        return blob.signUrl(7, TimeUnit.DAYS).toString();
    }

    @Override

    public String getDownloadUrl(String filePath) {
        Bucket bucket = StorageClient.getInstance().bucket();
        Blob blob = bucket.get(filePath);

        return blob.signUrl(7, TimeUnit.DAYS).toString();
    }

}
