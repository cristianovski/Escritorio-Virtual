import { useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';
import { ClientDocument } from '../types';
import {
  createDocumentAccessUrls,
  getDocumentObjectKeyForClient,
  getDocumentPreviewPlaceholder,
  removeDocumentObject,
} from '../lib/documentStorage';

const OPCOES_DOCUMENTOS: Record<string, string[]> = {
  'Pessoal': [
    'Documento de Identificação (RG/CNH)',
    'CPF',
    'Comprovante de Endereço',
    'Certidão de Casamento / Nascimento',
    'Outros Documentos Pessoais'
  ],
  'Provas': [
    'Autodeclaração do Segurado Especial',
    'Contratos Rurais (Arrendamento, parceria, meação, comodato)',
    'DAP / CAF',
    'Comprovantes de Venda / Notas Fiscais (Bloco de Notas)',
    'Comprovante de Recolhimento (Funrural/GPS)',
    'Imposto de Renda Rural (IRPF)',
    'Documentos de Terra e Posse (INCRA, ITR, DIAC/DIAT, Escritura)',
    'Certidão FUNAI',
    'Documentos Civis (com indicação de profissão rural)',
    'Documentos Eleitorais (Ficha de cadastro, Certidão)',
    'Documentos Militares (Alistamento, Quitação)',
    'Documentos Escolares (Matrícula, boletim em escola rural)',
    'Documentos de Saúde (Posto de saúde, vacinação, gestante)',
    'Associações e Sindicatos (Ficha, recibos de contribuição)',
    'Insumos e Crédito (Recibos agrícolas, empréstimo rural)',
    'Programas do Governo (Emater, assistência técnica)',
    'Registros Diversos (Processos judiciais, religiosas, comunitárias)'
  ],
  'Processual': [
    'Procuração',
    'Contrato de Honorários',
    'Declaração de Hipossuficiência',
    'Termo de Renúncia',
    'Petição Inicial',
    'Outros Documentos Processuais'
  ],
  'Diversos': ['Outros']
};

const LEGAL_BASIS: Record<string, { law: string; obs: string }> = {
  "Autodeclaração do Segurado Especial": { law: "Lei 8.213/91, Art. 38-B, § 2º; IN 128/2022, Art. 115", obs: "Prova central, devendo ser ratificada." },
  // ... (complete com as demais se quiser, mas não é obrigatório para o funcionamento)
};

export function useDocumentEditor(onSuccess: () => void) {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<ClientDocument | null>(null);
  const [selectedDownloadUrl, setSelectedDownloadUrl] = useState<string | null>(null);
  const [selectedAccessError, setSelectedAccessError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const selectionRequestRef = useRef(0);
  const [editForm, setEditForm] = useState({
    title: '',
    customTitle: '',
    category: 'Provas' as ClientDocument['category'],
    reference_date: '',
    description: '',
  });

  const handleSelectDoc = (doc: ClientDocument) => {
    const requestId = selectionRequestRef.current + 1;
    selectionRequestRef.current = requestId;
    const isStandard = Object.values(OPCOES_DOCUMENTOS).flat().includes(doc.title);
    setEditForm({
      title: isStandard ? doc.title : 'Outros',
      customTitle: isStandard ? '' : doc.title,
      category: doc.category,
      reference_date: doc.reference_date || '',
      description: doc.description || '',
    });
    setIsEditing(false);
    setSelectedDownloadUrl(null);
    setSelectedAccessError(null);

    const objectKey = getDocumentObjectKeyForClient(doc.file_url, doc.client_id);
    setSelectedDoc({
      ...doc,
      file_url: getDocumentPreviewPlaceholder(objectKey || doc.file_url),
    });

    if (!objectKey) {
      const message = 'A localização do arquivo é inválida. O registro foi preservado.';
      setSelectedAccessError(message);
      toast({
        title: 'Documento indisponível',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    void createDocumentAccessUrls(objectKey, doc.title)
      .then(({ previewUrl, downloadUrl }) => {
        if (selectionRequestRef.current !== requestId) return;

        setSelectedDoc((currentDoc) => currentDoc?.id === doc.id
          ? { ...currentDoc, file_url: previewUrl }
          : currentDoc);
        setSelectedDownloadUrl(downloadUrl);
      })
      .catch((error: unknown) => {
        if (selectionRequestRef.current !== requestId) return;

        const msg = error instanceof Error
          ? error.message
          : 'Não foi possível autorizar o acesso ao arquivo.';
        setSelectedDownloadUrl(null);
        setSelectedAccessError(msg);
        toast({ title: 'Documento indisponível', description: msg, variant: 'destructive' });
      });
  };

  const closeSelectedDoc = () => {
    selectionRequestRef.current += 1;
    setSelectedDoc(null);
    setSelectedDownloadUrl(null);
    setSelectedAccessError(null);
    setIsEditing(false);
  };

  const handleSaveEdits = async () => {
    if (!selectedDoc) return;
    setSaving(true);

    let finalTitle = editForm.title;
    if (finalTitle === 'Outros') {
      if (!editForm.customTitle.trim()) {
        setSaving(false);
        toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
        return;
      }
      finalTitle = editForm.customTitle;
    }

    try {
      const { data: updatedDocument, error } = await supabase
        .from('client_documents')
        .update({
          title: finalTitle,
          category: editForm.category,
          reference_date: editForm.reference_date || null,
          description: editForm.description,
        })
        .eq('id', selectedDoc.id)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!updatedDocument) throw new Error('O banco não confirmou a atualização do documento.');

      toast({ title: 'Atualizado', description: 'Dados alterados com sucesso.', variant: 'success' });
      setIsEditing(false);
      onSuccess();
      setSelectedDoc(prev => prev ? { ...prev, title: finalTitle, category: editForm.category, reference_date: editForm.reference_date || null, description: editForm.description } : null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDoc = async () => {
    if (!selectedDoc) return;
    if (!confirm('Excluir este documento permanentemente?')) return;
    setSaving(true);

    try {
      const { data: persistedDocument, error: fetchError } = await supabase
        .from('client_documents')
        .select('id, client_id, file_url')
        .eq('id', selectedDoc.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!persistedDocument) {
        throw new Error('O registro não foi encontrado. Nenhum arquivo foi removido.');
      }

      const objectKey = getDocumentObjectKeyForClient(
        persistedDocument.file_url,
        persistedDocument.client_id,
      );
      if (!objectKey) {
        throw new Error(
          'Não foi possível identificar o arquivo físico. O registro foi preservado.',
        );
      }

      const { data: deletedRows, error: deleteError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', selectedDoc.id)
        .select('id');

      if (deleteError) throw deleteError;
      if (!deletedRows || deletedRows.length !== 1) {
        throw new Error('O banco não confirmou a exclusão do registro.');
      }

      selectionRequestRef.current += 1;
      setSelectedDoc(null);
      setSelectedDownloadUrl(null);
      setSelectedAccessError(null);

      try {
        await removeDocumentObject(objectKey);
        toast({ title: 'Excluído', description: 'Documento removido.', variant: 'success' });
      } catch (storageError: unknown) {
        const cleanupMessage = storageError instanceof Error
          ? storageError.message
          : 'Falha desconhecida na remoção do arquivo físico.';

        console.error('Documento órfão no Storage após exclusão do registro.', {
          documentId: persistedDocument.id,
          objectKey,
          error: storageError,
        });
        Sentry.captureException(storageError, {
          tags: { operation: 'document-storage-orphan-cleanup' },
          extra: { documentId: persistedDocument.id, objectKey },
        });
        toast({
          title: 'Registro excluído; limpeza pendente',
          description: `${cleanupMessage} A falha foi registrada para limpeza pelo suporte.`,
          variant: 'destructive',
        });
      }

      onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao excluir';
      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getLegalInfo = (title: string) => {
    return LEGAL_BASIS[title] || null;
  };

  return {
    selectedDoc,
    selectedDownloadUrl,
    selectedAccessError,
    isEditing,
    saving,
    editForm,
    setEditForm,
    handleSelectDoc,
    closeSelectedDoc,
    handleSaveEdits,
    handleDeleteDoc,
    getLegalInfo,
    setIsEditing,
    OPCOES_DOCUMENTOS,
  };
}
