// App.tsx
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppNavigator from './src/navigation/AppNavigator';

// Importa tu instancia axios y la base URL 
import { api, API_BASE_URL } from './src/services/chocolateService';

enableScreens();
const qc = new QueryClient();

export default function App() {
  useEffect(() => {
    let cancelled = false;

    const wakeUpBackend = async () => {
      try {
        console.log('[BOOT] Warming backend at', API_BASE_URL);

        // 1) ping rápido para “despertar” Render
        const t0 = Date.now();
        const health = await api.get('/health/', { timeout: 10000 });
        if (!cancelled) {
          console.log(
            '[BOOT] /health =',
            health?.data,
            `(${Date.now() - t0}ms)`
          );
        }

        // 2) opcional: forza carga del modelo (puede tardar en el primer hit)
        const t1 = Date.now();
        await api.get('/model-info/', { timeout: 30000 });
        if (!cancelled) {
          console.log('[BOOT] /model-info OK', `(${Date.now() - t1}ms)`);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.log(
            '[BOOT] warmup error:',
            err?.message,
            err?.code,
            err?.response?.status,
            err?.response?.data
          );
        }
      }
    };

    wakeUpBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
