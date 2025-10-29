import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import CustomHeader from '../components/CustomHeader';
import Footer from '../components/Footer';

import { ChocolateAssessmentScreen } from '../screens/ChocolateAssessmentScreen';
import { AssessmentResultScreen } from '../screens/AssessmentResultScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  return (
    <NavigationContainer>
      <View style={styles.appContainer}>
        <CustomHeader title="Catador de Cacao" subtitle="Evaluación de Calidad" />
        <View style={styles.content}>
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false,
            }} 
            initialRouteName="ChocolateAssessment"
          >
            <Stack.Screen name="ChocolateAssessment" component={ChocolateAssessmentScreen} />
            <Stack.Screen name="AssessmentResult" component={AssessmentResultScreen} />
          </Stack.Navigator>
        </View>
        <Footer />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default AppNavigator;
