import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AssessmentResult } from '../services/chocolateService';

export type RootStackParamList = {
  ChocolateAssessment: undefined;
  AssessmentResult: {
    result: AssessmentResult;
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}