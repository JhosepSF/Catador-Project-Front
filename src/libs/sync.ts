// src/lib/sync.ts
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import { db } from './db';

const BASE_URL = 'http://127.0.0.1:8000';          
const TOKEN: string | null = null;         

type PendingOp = {
  id: number;
  client_uuid: string;
  endpoint: string;
  method: string;
  body: string | null;
  form_field: string | null;
  file_id: number | null;
};

type FileRow = {
  local_uri: string;
  filename: string;
};

type RecordRow = {
  client_uuid: string;
  payload: string; // JSON string
};

/** Completa dirección (region/provincia/distrito/direccion) en records 'pending'
 *  cuando hay lat/lng y falta alguno de esos campos. También asegura mapsUrl.
 *  Actualiza tanto la tabla records.payload como el body del create en pending_ops.
 */
async function preEnrichPendingRecords() {
  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) return;

  const recs = db.getAllSync(
    `SELECT client_uuid, payload FROM records WHERE sync_status='pending'`
  ) as RecordRow[];

  for (const r of recs) {
    try {
      const data = JSON.parse(r.payload) as any;
      const dp = data?.datos_personales ?? {};
      const hasLatLng = typeof dp.lat === 'number' && typeof dp.lng === 'number';

      const missingAddr =
        !dp?.direccion || !dp?.region || !dp?.provincia || !dp?.distrito;
      const missingMaps = !dp?.mapsUrl;

      if (!hasLatLng || (!missingAddr && !missingMaps)) continue;

      const [addr] = await Location.reverseGeocodeAsync({
        latitude: dp.lat,
        longitude: dp.lng,
      });

      const newDp = {
        ...dp,
        region: dp.region || addr?.region || '',
        provincia: dp.provincia || addr?.city || addr?.subregion || '',
        distrito: dp.distrito || addr?.district || '',
        direccion:
          dp.direccion ||
          [addr?.street, addr?.name, addr?.postalCode].filter(Boolean).join(' '),
        mapsUrl: dp.mapsUrl || `https://www.google.com/maps?q=${dp.lat},${dp.lng}`,
      };

      const newPayloadObj = { ...data, datos_personales: newDp };
      const newPayload = JSON.stringify(newPayloadObj);
      const now = new Date().toISOString();

      db.withTransactionSync(() => {
        // Actualiza la fila de records
        db.runSync(
          `UPDATE records SET payload=?, updated_at=? WHERE client_uuid=?`,
          [newPayload, now, r.client_uuid]
        );

        // Actualiza el body del create correspondiente en pending_ops
        db.runSync(
          `UPDATE pending_ops
             SET body=?
           WHERE client_uuid=? AND endpoint='/api/mucosa/registro' AND method='POST'`,
          [JSON.stringify({ client_uuid: r.client_uuid, ...newPayloadObj, updated_at: now }), r.client_uuid]
        );
      });
    } catch {
      // ignoramos errores de parseo o geocoding; se intentará luego
    }
  }
}

async function uploadFile(
  endpoint: string,
  field: string,
  fileUri: string,
  filename: string,
  client_uuid: string
) {
  const form = new FormData();
  form.append(field, { uri: fileUri, name: filename, type: 'image/jpeg' } as any);

  const res = await fetch(BASE_URL + endpoint, {
    method: 'POST',
    headers: {
      'Idempotency-Key': client_uuid, // opcional
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: form,
  });
  if (!res.ok) throw new Error('upload failed');
}

export async function trySync() {
  const net = await NetInfo.fetch();
  // isInternetReachable puede ser null: solo seguimos si es true
  if (!net.isConnected || net.isInternetReachable === false) return;

  // 1) Completa dirección/mapa si es posible antes de empujar
  await preEnrichPendingRecords();

  // 2) Lee un batch de operaciones pendientes
  const ops = db.getAllSync(
    `SELECT id,client_uuid,endpoint,method,body,form_field,file_id
     FROM pending_ops
     LIMIT 30`
  ) as PendingOp[];

  for (const op of ops) {
    try {
      if (op.file_id) {
        // Subida de archivo
        const row = db.getFirstSync(
          `SELECT local_uri, filename FROM files WHERE id=?`,
          [op.file_id]
        ) as FileRow | null;

        if (!row) {
          // no hay fila del archivo, limpia la op
          db.withTransactionSync(() => {
            db.runSync(`DELETE FROM pending_ops WHERE id=?`, [op.id]);
          });
          continue;
        }

        try {
          await uploadFile(
            op.endpoint,
            op.form_field || 'file',
            row.local_uri,
            row.filename,
            op.client_uuid
          );

          db.withTransactionSync(() => {
            db.runSync(`DELETE FROM pending_ops WHERE id=?`, [op.id]);
            db.runSync(`UPDATE files SET sync_status='synced' WHERE id=?`, [op.file_id]);
          });
        } catch {
          // fallo de red/servidor: incrementa retries
          db.withTransactionSync(() => {
            db.runSync(`UPDATE pending_ops SET retries=retries+1 WHERE id=?`, [op.id]);
          });
        }
      } else {
        // Crear/actualizar record (JSON)
        const res = await fetch(BASE_URL + op.endpoint, {
          method: op.method,
          headers: {
            'Content-Type': 'application/json',
            ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
            'Idempotency-Key': op.client_uuid,
          },
          body: op.body ?? undefined,
        });

        if (res.ok) {
          db.withTransactionSync(() => {
            db.runSync(`DELETE FROM pending_ops WHERE id=?`, [op.id]);
            db.runSync(`UPDATE records SET sync_status='synced' WHERE client_uuid=?`, [op.client_uuid]);
          });
        } else {
          db.withTransactionSync(() => {
            db.runSync(`UPDATE pending_ops SET retries=retries+1 WHERE id=?`, [op.id]);
          });
        }
      }
    } catch {
      // no-op; se reintentará en el siguiente ciclo
    }
  }
}

export function startAutoSync() {
  // al recuperar conectividad, intenta sincronizar
  const unsub = NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      trySync();
    }
  });
  return unsub;
}
