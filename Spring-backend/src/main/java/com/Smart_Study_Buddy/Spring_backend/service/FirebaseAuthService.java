package com.Smart_Study_Buddy.Spring_backend.service;

import org.springframework.stereotype.Service;

import com.google.firebase.FirebaseException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

@Service
public class FirebaseAuthService {

    public UserRecord createUser(String email, String password, String username) throws FirebaseException {

        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password)
                .setDisplayName(username);

        return FirebaseAuth.getInstance().createUser(request);
    }

    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().getUserByEmail(email);
    }

    public String createCustomerToken(String uid) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().createCustomToken(uid);
    }

    public UserRecord verifyAndGetUser(String email, String password) throws FirebaseAuthException {
        return getUserByEmail(email);
    }

}
