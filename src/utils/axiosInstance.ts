import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiConfig extends AxiosRequestConfig {
    baseURL: string;
    timeout: number;
    headers?: {
        'Content-Type': string;
        Authorization?: string;
    };
}

const apiConfig: ApiConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

const AxiosInstances: AxiosInstance = axios.create(apiConfig);

export default AxiosInstances