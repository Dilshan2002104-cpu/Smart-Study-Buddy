package com.Smart_Study_Buddy.Spring_backend.dto;

import java.util.Date;

public class DocumentResponse {

    private String id;
    private String filename;
    private String downloadUrl;
    private Date uploadDate;

    public DocumentResponse() {}
    
    public DocumentResponse(String id, String filename, String downloadUrl, Date uploadDate) {
        this.id = id;
        this.filename = filename;
        this.downloadUrl = downloadUrl;
        this.uploadDate = uploadDate;
    }
    
    // Getters and Setters
    public String getId() { 
        return id; 
    }
    
    public void setId(String id) { 
        this.id = id; 
    }
    
    public String getFilename() { 
        return filename; 
    }
    
    public void setFilename(String filename) { 
        this.filename = filename; 
    }
    
    public String getDownloadUrl() { 
        return downloadUrl; 
    }
    
    public void setDownloadUrl(String downloadUrl) { 
        this.downloadUrl = downloadUrl; 
    }
    
    public Date getUploadDate() { 
        return uploadDate; 
    }
    
    public void setUploadDate(Date uploadDate) { 
        this.uploadDate = uploadDate; 
    }

}
