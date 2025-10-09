// src/lib/sync.ts
import NetInfo from '@react-native-community/netinfo';
import { db } from './db';

const BASE_URL = 'http://TU_IP:8000';          // <-- cámbialo
const TOKEN: string | null = null;             // o léelo de SecureStore si lo tendrás

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

  // lee un batch de operaciones pendientes
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
