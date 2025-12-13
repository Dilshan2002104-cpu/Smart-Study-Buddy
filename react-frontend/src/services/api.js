import axios from "axios";

const API_URL = "http://localhost:8080/api";

export const registerUser = (username,email,password) => {
    return axios.post(`${API_URL}/auth/register`,{
        username,
        email,
        password
    });
};

export const loginUser = (email,password) => {
    return axios.post(`${API_URL}/auth/login`,{
        email,
        password
    });
};

export const uploadFile = (file,userId) => {
    const formData = new FormData();
    formData.append('file',file);
    formData.append('userId',userId);

    return axios.post(`${API_URL}/documents/upload`,formData,{
        headers: {
            "Content-Type":"multipart/form-data"
        }
    });
};

export const getUserDocuments = (userId) => {
    return axios.get(`${API_URL}/documents`,{
        params:{userId}
    });
};