import axios, { AxiosInstance } from "axios";
import { SecureGlobalState } from "../handler/SecureGlobalState";

export type TVscodePayload = {
    code: string;
    type: 'document' | 'snippet';
    fileExtension: 'html' | 'css' | 'js';
};

const client: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api/protected'
});

// Configure the secure token attachment once
client.interceptors.request.use(async (config) => {
    const token = await SecureGlobalState.instance.getSecret('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const ApiService = {
    async exportCode(payload: TVscodePayload): Promise<any> {
        try {
            const response = await client.post('/export', payload);
            return response.data;
        } catch (error: any) {
            // Translate low-level network errors into clean readable messages
            if (error.code === 'ECONNREFUSED') {
                throw new Error('Express server is offline.');
            }
            if (error.response?.data) {
                throw new Error(`Sync Error: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(error.message || 'Unknown network sync error.');
        }
    }
};