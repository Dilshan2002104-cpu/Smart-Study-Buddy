package com.Smart_Study_Buddy.Spring_backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class YouTubeResponse {

    private boolean success;

    @JsonProperty("video_id")
    private String videoId;

    private String title;

    private String channel;

    @JsonProperty("thumbnail_url")
    private String thumbnailUrl;

    private List<TranscriptEntry> transcript;

    @JsonProperty("full_text")
    private String fullText;

    private String language;

    @JsonProperty("is_generated")
    private boolean isGenerated;

    private double duration;

    private String error;

    // Nested class for transcript entries
    public static class TranscriptEntry {
        private String text;
        private double start;
        private double duration;

        public TranscriptEntry() {
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public double getStart() {
            return start;
        }

        public void setStart(double start) {
            this.start = start;
        }

        public double getDuration() {
            return duration;
        }

        public void setDuration(double duration) {
            this.duration = duration;
        }
    }

    // Constructors
    public YouTubeResponse() {
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public List<TranscriptEntry> getTranscript() {
        return transcript;
    }

    public void setTranscript(List<TranscriptEntry> transcript) {
        this.transcript = transcript;
    }

    public String getFullText() {
        return fullText;
    }

    public void setFullText(String fullText) {
        this.fullText = fullText;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public boolean isGenerated() {
        return isGenerated;
    }

    public void setGenerated(boolean generated) {
        isGenerated = generated;
    }

    public double getDuration() {
        return duration;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
