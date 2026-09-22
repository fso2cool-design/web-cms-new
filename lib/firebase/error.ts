import { auth } from './client';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = auth?.currentUser;
  const rawMsg = error instanceof Error ? error.message : String(error);
  const errorCode = (error as any)?.code || (rawMsg.includes('permission-denied') ? 'permission-denied' : 'unknown');

  console.error(
    `[Firebase] Operation: ${operationType.toUpperCase()}\n` +
    `[Firebase] Path: ${path || 'unknown'}\n` +
    `[Firebase] User: ${currentAuth?.email || 'unauthenticated (no user logged in)'}\n` +
    `[Firebase] Error: ${errorCode} - ${rawMsg}`
  );

  const errInfo: FirestoreErrorInfo = {
    error: rawMsg,
    authInfo: {
      userId: currentAuth?.uid || null,
      email: currentAuth?.email || null,
      emailVerified: currentAuth?.emailVerified || null,
      isAnonymous: currentAuth?.isAnonymous || null,
      tenantId: currentAuth?.tenantId || null,
      providerInfo:
        currentAuth?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (errorCode === 'permission-denied' || rawMsg.toLowerCase().includes('permission-denied') || rawMsg.toLowerCase().includes('missing or insufficient permissions')) {
    throw new Error(
      `Izin Ditolak (permission-denied): Anda tidak memiliki wewenang untuk ${operationType} pada ${path || 'koleksi'}. Pastikan Anda login dengan akun administrator resmi.`
    );
  }

  throw new Error(JSON.stringify(errInfo));
}
