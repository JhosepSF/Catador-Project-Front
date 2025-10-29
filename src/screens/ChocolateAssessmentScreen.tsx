import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackScreenProps } from '../types/navigation';
import { AssessmentData, chocolateAssessmentService } from '../services/chocolateService';

type Props = RootStackScreenProps<'ChocolateAssessment'>;

export const ChocolateAssessmentScreen: React.FC = () => {
  const navigation = useNavigation<Props['navigation']>();
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    cacaoType: '',
    phLevel: '',
    purity: '',
  });

  const handleSubmit = async () => {
    try {
      console.log('[UI] Enviando assessmentData =', assessmentData); // <= LOG A
      const result = await chocolateAssessmentService.submitAssessment(assessmentData);
      console.log('[UI] Result =', result); // <= LOG B
      navigation.navigate('AssessmentResult', { result });
    } catch (error: any) {
      console.log('[UI] Error submitAssessment =', error?.message || error); // <= LOG C
      Alert.alert('Error', 'No se pudo procesar la evaluación');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Evaluación de Cacao</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Cacao</Text>
          <TextInput
            style={styles.input}
            value={assessmentData.cacaoType}
            onChangeText={(text) => setAssessmentData({ ...assessmentData, cacaoType: text })}
            placeholder="Ingrese el tipo de cacao"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nivel de pH</Text>
          <TextInput
            style={styles.input}
            value={assessmentData.phLevel}
            onChangeText={(text) => setAssessmentData({ ...assessmentData, phLevel: text })}
            placeholder="Ingrese el nivel de pH"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pureza (%)</Text>
          <TextInput
            style={styles.input}
            value={assessmentData.purity}
            onChangeText={(text) => setAssessmentData({ ...assessmentData, purity: text })}
            placeholder="Ingrese el porcentaje de pureza"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Evaluar Muestra</Text>
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
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});