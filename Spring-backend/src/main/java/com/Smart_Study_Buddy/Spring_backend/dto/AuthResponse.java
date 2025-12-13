package com.Smart_Study_Buddy.Spring_backend.dto;

public class AuthResponse {

    private String userId;
    private String username;
    private String email;
    private String customToken;
    private String message;

    public AuthResponse() {}
    
    public AuthResponse(String userId, String username, String email, String customToken) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.customToken = customToken;
    }
    
    // Getters and Setters
    public String getUserId() { 
        return userId; 
    }
    
    public void setUserId(String userId) { 
        this.userId = userId; 
    }
    
    public String getUsername() { 
        return username; 
    }
    
    public void setUsername(String username) { 
        this.username = username; 
    }
    
    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }
    
    public String getCustomToken() { 
        return customToken; 
    }
    
    public void setCustomToken(String customToken) { 
        this.customToken = customToken; 
    }
    
    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }
}
