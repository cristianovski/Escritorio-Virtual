import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}));

import {
  createDocumentObjectKey,
  getDocumentObjectKey,
  getDocumentObjectKeyForClient,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocumentFile,
} from './documentStorage';

beforeAll(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function arrayBuffer() {
      return new Response(this).arrayBuffer();
    };
  }
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe('getDocumentObjectKey', () => {
  it('mantém uma chave nova e opaca', () => {
    expect(getDocumentObjectKey('42/550e8400-e29b-41d4-a716-446655440000.pdf'))
      .toBe('42/550e8400-e29b-41d4-a716-446655440000.pdf');
  });

  it('extrai a chave de uma URL pública legada', () => {
    const legacyUrl =
      'https://example.supabase.co/storage/v1/object/public/evidence-files/42/documento%20antigo.pdf';

    expect(getDocumentObjectKey(legacyUrl)).toBe('42/documento antigo.pdf');
  });

  it('extrai a chave de uma URL assinada mesmo com query e fragmento', () => {
    const signedUrl =
      'https://example.supabase.co/storage/v1/object/sign/evidence-files/42/documento.pdf?token=abc#preview.pdf';

    expect(getDocumentObjectKey(signedUrl)).toBe('42/documento.pdf');
  });

  it('rejeita URL externa e segmentos inseguros', () => {
    expect(getDocumentObjectKey('https://files.example.com/documento.pdf')).toBeNull();
    expect(getDocumentObjectKey(
      'https://evil.example/storage/v1/object/public/evidence-files/42/documento.pdf',
    )).toBeNull();
    expect(getDocumentObjectKey('data:application/pdf;base64,JVBERi0x')).toBeNull();
    expect(getDocumentObjectKey('42/../documento.pdf')).toBeNull();
  });

  it('confirma que a pasta pertence ao cliente esperado', () => {
    const objectKey = '42/550e8400-e29b-41d4-a716-446655440000.pdf';

    expect(getDocumentObjectKeyForClient(objectKey, 42)).toBe(objectKey);
    expect(getDocumentObjectKeyForClient(objectKey, 41)).toBeNull();
  });
});

describe('createDocumentObjectKey', () => {
  it('não inclui o título original na chave', () => {
    const objectKey = createDocumentObjectKey(42, 'pdf');

    expect(objectKey).toMatch(/^42\/[0-9a-f-]{36}\.pdf$/);
    expect(objectKey).not.toContain('cliente');
  });
});

describe('validateDocumentFile', () => {
  it('aceita PDF quando MIME e assinatura correspondem', async () => {
    const file = new File(['%PDF-1.7\nconteudo'], 'prova.pdf', { type: 'application/pdf' });

    await expect(validateDocumentFile(file)).resolves.toEqual({
      contentType: 'application/pdf',
      extension: 'pdf',
    });
  });

  it('rejeita arquivo disfarçado com MIME de PDF', async () => {
    const file = new File(['conteudo de texto'], 'prova.pdf', { type: 'application/pdf' });

    await expect(validateDocumentFile(file)).rejects.toThrow(
      'O conteúdo do arquivo não corresponde ao formato informado.',
    );
  });

  it('rejeita tamanho acima do limite antes de ler o conteúdo', async () => {
    const oversizedFile = {
      size: MAX_DOCUMENT_SIZE_BYTES + 1,
      type: 'application/pdf',
    } as File;

    await expect(validateDocumentFile(oversizedFile)).rejects.toThrow('limite de 20 MB');
  });
});
