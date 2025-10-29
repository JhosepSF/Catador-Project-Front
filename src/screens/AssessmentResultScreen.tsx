import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { AssessmentResult } from '../services/chocolateService';

type Props = RootStackScreenProps<'AssessmentResult'>;

export const AssessmentResultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Props['route']>();
  const { result } = route.params;

  const getGradeColor = () => {
    switch (result.grade) {
      case 'APTO_CHOCOLATE':
        return '#2ecc71';
      case 'NO_APTO':
        return '#e74c3c';
      case 'APTO_OTROS_USOS':
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  const getGradeText = () => {
    switch (result.grade) {
      case 'APTO_CHOCOLATE':
        return 'Apto para Chocolate';
      case 'NO_APTO':
        return 'No Apto';
      case 'APTO_OTROS_USOS':
        return 'Apto para Otros Usos';
      default:
        return 'Sin clasificación';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Resultado de la Evaluación</Text>

        <View style={[styles.gradeContainer, { backgroundColor: getGradeColor() }]}>
          <Text style={styles.gradeText}>{getGradeText()}</Text>
          <Text style={styles.scoreText}>Puntaje: {result.score}/100</Text>
        </View>

        <TouchableOpacity 
          style={styles.newAssessmentButton}
          onPress={() => navigation.navigate('ChocolateAssessment')}
        >
          <Text style={styles.buttonText}>Nueva Evaluación</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  gradeContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    color: '#fff',
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  recommendationItem: {
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
  newAssessmentButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});