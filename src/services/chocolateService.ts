import axios from 'axios';

const API_BASE_URL = 'http://192.168.18.24:8000/api'

console.log('[API] BASE_URL =', API_BASE_URL); 

export type AssessmentData = {
  cacaoType: string;
  phLevel: string;
  purity: string;
};

export type AssessmentResult = {
  grade: 'APTO_CHOCOLATE' | 'NO_APTO' | 'APTO_OTROS_USOS';
  score: number;
  recommendations: string[];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

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

export const chocolateAssessmentService = {
  async submitAssessment(data: AssessmentData): Promise<AssessmentResult> {
    console.log('[Service] submitAssessment payload =', data); // <= LOG 3
    const response = await api.post('/predict/', data);
    console.log('[Service] submitAssessment response =', response.data); // <= LOG 4

    const prediction: number = response.data?.prediction;
    return {
      grade: 'APTO_CHOCOLATE',
      score: prediction,
      recommendations: [],
    };
  },
};
