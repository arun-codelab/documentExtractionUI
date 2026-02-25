import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const uploadDocuments = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/workflow-process`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.result;
    } catch (error) {
        console.error('Error uploading documents:', error);
        throw error;
    }
};

export const summarizeDocuments = async (formData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/summarize`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error summarizing documents:', error);
        throw error;
    }
};
