// App.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppNavigator from './src/navigation/AppNavigator';

// axios/baseURL
import { api, API_BASE_URL } from './src/services/chocolateService';
import WarmupBanner, { type WarmupState } from './src/components/WarmupBanner';

enableScreens();
const qc = new QueryClient();

export default function App() {
  const [warmupState, setWarmupState] = useState<WarmupState>('idle');
  const [warmupMsg, setWarmupMsg] = useState<string | undefined>(undefined);

  const wakeUpBackend = async () => {
    setWarmupState('warming');
    setWarmupMsg(undefined);
    try {
      console.log('[BOOT] Warming backend at', API_BASE_URL);

      const t0 = Date.now();
      const health = await api.get('/health/', { timeout: 10000 });
      console.log('[BOOT] /health =', health?.data, `(${Date.now() - t0}ms)`);

      const t1 = Date.now();
      await api.get('/model-info/', { timeout: 30000 });
      console.log('[BOOT] /model-info OK', `(${Date.now() - t1}ms)`);

      setWarmupState('ok');
    } catch (err: any) {
      const msg = `${err?.message ?? 'falló la conexión'}` +
                  (err?.response?.status ? ` (HTTP ${err.response.status})` : '');
      console.log('[BOOT] warmup error:', msg);
      setWarmupMsg(msg);
      setWarmupState('error');
    }
  };

  useEffect(() => {
    wakeUpBackend();
    // no cleanup necesario
  }, []);

  return (
    <SafeAreaProvider>
      {/* Banner animado encima de toda la app */}
      <WarmupBanner state={warmupState} message={warmupMsg} onRetry={wakeUpBackend} />

      <QueryClientProvider client={qc}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
