// App.tsx
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppNavigator from './src/navigation/AppNavigator';

enableScreens(); 
const qc = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
