package com.Smart_Study_Buddy.Spring_backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {

    /**
     * Upload a file to storage
     * 
     * @param file        The file to upload
     * @param storagePath The path where the file should be stored
     * @return The storage path of the uploaded file
     * @throws IOException if upload fails
     */
    String uploadFile(MultipartFile file, String storagePath) throws IOException;

    /**
     * Get a download URL for a file
     * 
     * @param filePath The path to the file in storage
     * @return A signed URL that can be used to download the file
     */
    String getDownloadUrl(String filePath);
}
