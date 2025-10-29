import axios from 'axios';

const API_BASE_URL = 'http://your-api-url/api'; 

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

export const chocolateAssessmentService = {
  // Enviar los datos de evaluación al servidor
  async submitAssessment(data: AssessmentData): Promise<AssessmentResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/assessments`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw new Error('No se pudo enviar la evaluación al servidor');
    }
  },

  // Obtener el historial de evaluaciones
  async getAssessmentHistory(): Promise<AssessmentResult[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/assessments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assessment history:', error);
      throw new Error('No se pudo obtener el historial de evaluaciones');
    }
  },
};