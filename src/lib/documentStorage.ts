import { supabase } from './supabase';

export const DOCUMENT_STORAGE_BUCKET = 'evidence-files';
export const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;

const SIGNED_URL_TTL_SECONDS = 10 * 60;
const PDF_PLACEHOLDER_URL = 'about:blank#preview.pdf';
const IMAGE_PLACEHOLDER_URL =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const CANONICAL_MIME_TYPES = {
  'application/pdf': { extension: 'pdf', label: 'PDF' },
  'image/jpeg': { extension: 'jpg', label: 'JPEG' },
  'image/png': { extension: 'png', label: 'PNG' },
  'image/webp': { extension: 'webp', label: 'WebP' },
} as const;

type CanonicalMimeType = keyof typeof CANONICAL_MIME_TYPES;

export interface ValidatedDocumentFile {
  contentType: CanonicalMimeType;
  extension: string;
}

export interface DocumentAccessUrls {
  objectKey: string;
  previewUrl: string;
  downloadUrl: string;
}

function normalizeDeclaredMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
}

function matchesBytes(bytes: Uint8Array, expected: number[], offset = 0): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function detectMimeType(bytes: Uint8Array): CanonicalMimeType | null {
  if (matchesBytes(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (matchesBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (
    matchesBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp';
  }

  if (matchesBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'application/pdf';

  return null;
}

export async function validateDocumentFile(file: File): Promise<ValidatedDocumentFile> {
  if (file.size === 0) {
    throw new Error('O arquivo está vazio. Selecione outro documento.');
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error('O arquivo excede o limite de 20 MB. Comprima-o antes do envio.');
  }

  const declaredMimeType = normalizeDeclaredMimeType(file.type);
  if (!(declaredMimeType in CANONICAL_MIME_TYPES)) {
    throw new Error('Formato não permitido. Envie um arquivo PDF, JPEG, PNG ou WebP.');
  }

  const headerBytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const detectedMimeType = detectMimeType(headerBytes);
  if (!detectedMimeType || detectedMimeType !== declaredMimeType) {
    throw new Error('O conteúdo do arquivo não corresponde ao formato informado.');
  }

  return {
    contentType: detectedMimeType,
    extension: CANONICAL_MIME_TYPES[detectedMimeType].extension,
  };
}

export function createDocumentObjectKey(clientId: number, extension: string): string {
  if (!Number.isSafeInteger(clientId) || clientId <= 0) {
    throw new Error('Cliente inválido para o armazenamento do documento.');
  }

  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Este navegador não oferece geração segura de identificadores. Atualize-o.');
  }

  if (!/^[a-z0-9]+$/.test(extension)) {
    throw new Error('Extensão inválida para o armazenamento do documento.');
  }

  return `${clientId}/${globalThis.crypto.randomUUID()}.${extension}`;
}

function normalizeObjectKey(value: string): string | null {
  let key = value.replace(/^\/+/, '');

  try {
    key = decodeURIComponent(key);
  } catch {
    return null;
  }

  const segments = key.split('/');
  if (
    !key ||
    key.includes('\\') ||
    key.includes('\0') ||
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    return null;
  }

  return key;
}

export function getDocumentObjectKey(storedValue: string): string | null {
  const value = storedValue.trim();
  if (!value) return null;

  if (!/^https?:\/\//i.test(value)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
    return normalizeObjectKey(value);
  }

  let storageUrl: URL;
  try {
    storageUrl = new URL(value);
  } catch {
    return null;
  }

  const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!configuredSupabaseUrl) return null;

  try {
    if (storageUrl.host !== new URL(configuredSupabaseUrl).host) return null;
  } catch {
    return null;
  }

  const escapedBucket = DOCUMENT_STORAGE_BUCKET.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const storagePathPattern = new RegExp(
    `^/storage/v1/(?:object|render/image)/(?:public|sign|authenticated)/${escapedBucket}/(.+)$`,
  );
  const match = storageUrl.pathname.match(storagePathPattern);

  return match ? normalizeObjectKey(match[1]) : null;
}

export function getDocumentObjectKeyForClient(
  storedValue: string,
  clientId: number,
): string | null {
  if (!Number.isSafeInteger(clientId) || clientId <= 0) return null;

  const objectKey = getDocumentObjectKey(storedValue);
  if (!objectKey) return null;

  return objectKey.split('/', 1)[0] === String(clientId) ? objectKey : null;
}

function getObjectExtension(objectKey: string): string {
  const fileName = objectKey.split('/').pop() || '';
  const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
  return extension.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildDownloadName(title: string, objectKey: string): string {
  const extension = getObjectExtension(objectKey);
  const titleWithoutControlCharacters = Array.from(title, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint < 32 || codePoint === 127 ? '_' : character;
  }).join('');
  const baseName = titleWithoutControlCharacters
    .trim()
    .replace(/[\\/:*?"<>|%#&=+;]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120) || 'documento';

  return extension && !baseName.toLowerCase().endsWith(`.${extension}`)
    ? `${baseName}.${extension}`
    : baseName;
}

function addPreviewTypeHint(signedUrl: string, objectKey: string): string {
  return getObjectExtension(objectKey) === 'pdf'
    ? `${signedUrl}#preview.pdf`
    : signedUrl;
}

export function getDocumentPreviewPlaceholder(storedValue: string): string {
  const objectKey = getDocumentObjectKey(storedValue);
  return objectKey && getObjectExtension(objectKey) === 'pdf'
    ? PDF_PLACEHOLDER_URL
    : IMAGE_PLACEHOLDER_URL;
}

export async function createDocumentPreviewUrl(storedValue: string): Promise<string> {
  const objectKey = getDocumentObjectKey(storedValue);
  if (!objectKey) {
    throw new Error('A localização deste documento é inválida ou não pertence ao armazenamento.');
  }

  const { data, error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .createSignedUrl(objectKey, SIGNED_URL_TTL_SECONDS);

  if (error) throw error;
  return addPreviewTypeHint(data.signedUrl, objectKey);
}

export async function createDocumentAccessUrls(
  storedValue: string,
  documentTitle: string,
): Promise<DocumentAccessUrls> {
  const objectKey = getDocumentObjectKey(storedValue);
  if (!objectKey) {
    throw new Error('A localização deste documento é inválida ou não pertence ao armazenamento.');
  }

  const [previewResult, downloadResult] = await Promise.all([
    supabase.storage
      .from(DOCUMENT_STORAGE_BUCKET)
      .createSignedUrl(objectKey, SIGNED_URL_TTL_SECONDS),
    supabase.storage
      .from(DOCUMENT_STORAGE_BUCKET)
      .createSignedUrl(objectKey, SIGNED_URL_TTL_SECONDS, {
        download: buildDownloadName(documentTitle, objectKey),
      }),
  ]);

  if (previewResult.error) throw previewResult.error;
  if (downloadResult.error) throw downloadResult.error;

  return {
    objectKey,
    previewUrl: addPreviewTypeHint(previewResult.data.signedUrl, objectKey),
    downloadUrl: downloadResult.data.signedUrl,
  };
}

export async function removeDocumentObject(objectKey: string): Promise<void> {
  const normalizedKey = getDocumentObjectKey(objectKey);
  if (!normalizedKey) {
    throw new Error('Não foi possível identificar o arquivo físico deste documento.');
  }

  const { error } = await supabase.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .remove([normalizedKey]);

  if (error) throw error;
}
