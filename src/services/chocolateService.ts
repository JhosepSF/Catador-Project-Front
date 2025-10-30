// services/chocolateService.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';
import type { AxiosError } from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (__DEV__
    ? (Platform.OS === 'android'
        ? 'http://10.0.2.2:8000/api'
        : 'http://127.0.0.1:8000/api')
    : 'https://catador-project-back.onrender.com/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    const status = error.response?.status ?? 0;      // 0 si no hay response
    const isTimeout = error.code === 'ECONNABORTED'; // timeout de axios
    return (
      axiosRetry.isNetworkError(error) ||  // sin internet / DNS / CORS
      axiosRetry.isRetryableError(error) || // 5xx, etc.
      isTimeout ||
      status >= 500                         // 5xx explícito
    );
  },
});

console.log('[API] BASE_URL =', API_BASE_URL);

export type AssessmentData = {
  cacaoType: string;
  phLevel: string;
  purity: string;
};

// Interceptores (útiles para ver TODO lo que sale/entra)
api.interceptors.request.use((config) => {
  console.log('[API][REQ]', config.method?.toUpperCase(), config.url, 'data=', config.data);
  return config;
});
api.interceptors.response.use(
  (res) => {
    console.log('[API][RES]', res.status, res.config.url, 'data=', res.data); // <= LOG 2
    return res;
  },
  (err) => {
    if (err.response) {
      console.log('[API][ERR]', err.config?.url, 'status=', err.response.status, 'data=', err.response.data);
    } else {
      console.log('[API][ERR]', err.message); // Network Error, timeout, etc.
    }
    return Promise.reject(err);
  }
);

export type AssessmentResult = {
  grade: 'APTO_CHOCOLATE' | 'NO_APTO';
  score: number;
};

const THRESHOLD = 50; // ← corte para NO_APTO

export const chocolateAssessmentService = {
  async submitAssessment(data: AssessmentData): Promise<AssessmentResult> {
    console.log('[Service] submitAssessment payload =', data);
    const response = await api.post('/predict/', data);
    console.log('[Service] submitAssessment response =', response.data);

    // Asegurar número
    const score = Number(response.data?.prediction);
    if (!Number.isFinite(score)) {
      throw new Error('Respuesta inválida del backend: "prediction" no es numérico');
    }

    const grade: AssessmentResult['grade'] =
      score < THRESHOLD ? 'NO_APTO' : 'APTO_CHOCOLATE';

    return {
      grade,
      score,
    };
  },
};