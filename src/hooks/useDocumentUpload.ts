import { useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { getLocalDateISO } from '../lib/utils';
import { ClientDocument } from '../types';
import {
  createDocumentObjectKey,
  DOCUMENT_STORAGE_BUCKET,
  removeDocumentObject,
  validateDocumentFile,
} from '../lib/documentStorage';

export function useDocumentUpload(clientId: number, onSuccess: () => void) {
  const { toast } = useToast();
  const uploadInFlightRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    category: 'Provas' as ClientDocument['category'],
    customName: '',
    date: getLocalDateISO(),
    userObs: '',
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      await validateDocumentFile(file);
      const baseName = file.name.split('.').slice(0, -1).join('.') || file.name;
      setFileToUpload(file);
      setUploadMetadata({
        category: 'Provas',
        customName: baseName,
        date: getLocalDateISO(),
        userObs: '',
      });
      setIsUploadModalOpen(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Arquivo inválido';
      setFileToUpload(null);
      toast({ title: 'Arquivo não aceito', description: msg, variant: 'destructive' });
    }
  };

  const confirmUpload = async () => {
    if (!fileToUpload || uploadInFlightRef.current) return;

    const finalTitle = uploadMetadata.customName.trim();
    if (!finalTitle) {
      toast({ title: 'Atenção', description: 'Digite o nome do documento.', variant: 'destructive' });
      return;
    }

    uploadInFlightRef.current = true;
    setUploading(true);
    let uploadedObjectKey: string | null = null;
    try {
      const validatedFile = await validateDocumentFile(fileToUpload);
      const objectKey = createDocumentObjectKey(clientId, validatedFile.extension);
      uploadedObjectKey = objectKey;

      const { error: uploadError } = await supabase.storage
        .from(DOCUMENT_STORAGE_BUCKET)
        .upload(objectKey, fileToUpload, {
          contentType: validatedFile.contentType,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientId,
          title: finalTitle,
          category: uploadMetadata.category,
          file_url: objectKey,
          reference_date: uploadMetadata.date || null,
          description: uploadMetadata.userObs,
          source_origin: 'GED Novo',
        });

      if (dbError) throw dbError;
      uploadedObjectKey = null;

      toast({ title: 'Sucesso', description: 'Documento salvo.', variant: 'success' });
      setIsUploadModalOpen(false);
      setFileToUpload(null);
      onSuccess();
    } catch (error: unknown) {
      const baseMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      let msg = baseMessage;

      if (uploadedObjectKey) {
        const objectKeyToVerify = uploadedObjectKey;
        let verificationFailed = false;

        try {
          const { data: persistedDocument, error: verificationError } = await supabase
            .from('client_documents')
            .select('id')
            .eq('client_id', clientId)
            .eq('file_url', objectKeyToVerify)
            .maybeSingle();

          if (verificationError) throw verificationError;

          if (persistedDocument) {
            uploadedObjectKey = null;
            toast({
              title: 'Documento salvo',
              description: 'O registro foi confirmado após uma instabilidade de conexão.',
              variant: 'success',
            });
            setIsUploadModalOpen(false);
            setFileToUpload(null);
            onSuccess();
            return;
          }
        } catch (verificationError: unknown) {
          verificationFailed = true;
          uploadedObjectKey = null;
          const verificationMessage = verificationError instanceof Error
            ? verificationError.message
            : 'falha desconhecida';
          msg = `${baseMessage} Não foi possível confirmar o registro (${verificationMessage}); ` +
            'o arquivo foi mantido por segurança e a falha foi registrada para diagnóstico.';
          console.error('Upload pendente de reconciliação no Storage.', {
            objectKey: objectKeyToVerify,
            error: verificationError,
          });
          Sentry.captureException(verificationError, {
            tags: { operation: 'document-upload-reconciliation' },
            extra: { objectKey: objectKeyToVerify, clientId },
          });
        }

        if (!verificationFailed) {
          try {
            await removeDocumentObject(objectKeyToVerify);
            uploadedObjectKey = null;
          } catch (cleanupError: unknown) {
            const cleanupMessage = cleanupError instanceof Error
              ? cleanupError.message
              : 'falha desconhecida';
            msg = `${baseMessage} A limpeza do arquivo falhou (${cleanupMessage}); ` +
              'a falha foi registrada para limpeza pelo suporte.';
            console.error('Arquivo órfão após falha confirmada no registro do upload.', {
              objectKey: objectKeyToVerify,
              error: cleanupError,
            });
            Sentry.captureException(cleanupError, {
              tags: { operation: 'document-upload-orphan-cleanup' },
              extra: { objectKey: objectKeyToVerify, clientId },
            });
          }
        }
      }

      toast({ title: 'Erro no upload', description: msg, variant: 'destructive' });
    } finally {
      uploadInFlightRef.current = false;
      setUploading(false);
    }
  };

  return {
    uploading,
    isUploadModalOpen,
    setIsUploadModalOpen,
    fileToUpload,
    uploadMetadata,
    setUploadMetadata,
    handleFileSelect,
    confirmUpload,
  };
}
