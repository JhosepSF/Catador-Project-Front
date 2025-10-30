// src/services/diagnostics.ts
import axios from 'axios';
import { api, API_BASE_URL } from './chocolateService';

type DiagResult = {
  apiBaseUrl: string;
  health: any;
  modelInfo: any;
  httpbin: any;
};

function fmtErr(e: any) {
  return {
    message: e?.message,
    code: e?.code,
    status: e?.response?.status,
    data: e?.response?.data,
  };
}

export async function runConnectivityDiagnostics(): Promise<DiagResult> {
  const out: DiagResult = {
    apiBaseUrl: API_BASE_URL,
    health: null,
    modelInfo: null,
    httpbin: null,
  };

  try {
    const r = await api.get('/health/', { timeout: 10000 });
    out.health = r.data;
  } catch (e) {
    out.health = fmtErr(e);
  }

  try {
    const r = await api.get('/model-info/', { timeout: 30000 });
    out.modelInfo = r.data;
  } catch (e) {
    out.modelInfo = fmtErr(e);
  }

  // petición HTTPS a host neutro para distinguir problema de tu backend vs. red
  try {
    const r = await axios.get('https://httpbin.org/get', { timeout: 10000 });
    out.httpbin = { status: r.status };
  } catch (e) {
    out.httpbin = fmtErr(e);
  }

  console.log('[DIAG]', JSON.stringify(out, null, 2));
  return out;
}
