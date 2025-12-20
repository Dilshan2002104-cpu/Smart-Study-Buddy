package com.Smart_Study_Buddy.Spring_backend.dto;

public class YouTubeUploadRequest {
    private String url;
    private String userId;

    public YouTubeUploadRequest() {
    }

    public YouTubeUploadRequest(String url, String userId) {
        this.url = url;
        this.userId = userId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
