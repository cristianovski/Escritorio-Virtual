import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './use-toast';
import { Client, ClientDocument } from '../types';
import { getLocalDateISO } from '../lib/utils';

export type PeriodoType = 'rural' | 'urbano' | 'beneficio' | 'lacuna' | 'prova de retorno';

export interface Periodo {
  id: string;
  inicio: string;
  fim: string;
  tipo: PeriodoType;
  obs?: string;
  is_safra?: boolean;
  linkedDocId?: string;
  linkedDocTitle?: string;
  law?: string;
  dataExpedicao?: string; 
}

interface DocumentTimelineItem {
  id: string;
  type: string;
  issueDate: string;
  displayYear: string | number;
  fileUrl: string | null;
  origem: string;
}

// Helper interno para fuso horário correto no cálculo de dias
const parseLocal = (d: string) => new Date(`${d.split('T')[0]}T12:00:00`);

export function useBenefitAnalysis(cliente: Client) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [der, setDer] = useState(getLocalDateISO());
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [documentos, setDocumentos] = useState<DocumentTimelineItem[]>([]);

  useEffect(() => {
    if (cliente?.id) loadAllData();
  }, [cliente]);

  const loadAllData = async () => {
    // 🛡️ TRAVA DE SEGURANÇA EXTRA: Previne crash se o cliente sumir da memória
    if (!cliente?.id) return; 
    
    setLoading(true);
    try {
      const [interviewRes, newDocsRes] = await Promise.all([
        supabase
          .from('interviews')
          .select('analise_periodos, data_der')
          .eq('client_id', cliente.id)
          .maybeSingle(),
        supabase.from('client_documents').select('*').eq('client_id', cliente.id),
      ]);

      const interviewData = interviewRes.data;
      if (interviewData) {
        if (interviewData.analise_periodos) setPeriodos(interviewData.analise_periodos);
        if (interviewData.data_der) setDer(interviewData.data_der);
      }

      const newDocs = newDocsRes.data as ClientDocument[] | null;
      if (newDocs) {
        const docsDb = newDocs
          .filter((doc) => doc.category === 'Provas')
          .map((doc) => ({
            id: doc.id,
            type: doc.title || 'Sem Título',
            issueDate: doc.reference_date || doc.created_at || new Date().toISOString(),
            displayYear: new Date(doc.reference_date || doc.created_at || new Date()).getFullYear(),
            fileUrl: doc.file_url || null,
            origem: 'GED (Novo)',
          }));
        docsDb.sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
        setDocumentos(docsDb);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar dados.' });
    } finally {
      setLoading(false);
    }
  };

  const diffDays = (d1: string, d2: string) => {
    if (!d1 || !d2) return 0;
    // 🛡️ CORREÇÃO: Utilizando o parseLocal para evitar bugs de fuso horário
    const date1 = parseLocal(d1);
    const date2 = parseLocal(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSavePeriod = (form: Partial<Periodo>, editingId: string | null) => {
    if (!form.inicio || !form.fim) {
      toast({ title: 'Atenção', description: 'Preencha as datas de início e fim do período.', variant: 'destructive' });
      return;
    }
    let isSafra = false;
    if (form.tipo === 'urbano') {
      const dias = diffDays(form.inicio, form.fim);
      if (dias <= 120) isSafra = true;
    }
    const item: Periodo = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      inicio: form.inicio!,
      fim: form.fim!,
      tipo: form.tipo as PeriodoType,
      obs: form.obs,
      is_safra: isSafra,
      linkedDocTitle: form.linkedDocTitle,
      law: form.law,
      dataExpedicao: form.dataExpedicao,
    };
    if (editingId) {
      setPeriodos((prev) =>
        prev.map((p) => (p.id === editingId ? item : p)).sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime())
      );
    } else {
      setPeriodos((prev) => [...prev, item].sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()));
    }
  };

  const handleRemovePeriod = (id: string) => {
    setPeriodos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('interviews').upsert(
        {
          client_id: cliente.id,
          analise_periodos: periodos,
          data_der: der,
          updated_at: getLocalDateISO(),
        },
        { onConflict: 'client_id' }
      );
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cálculo salvo.', variant: 'success' });
    } catch (err: unknown) {
      toast({ title: 'Erro', description: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, der, setDer, periodos, documentos,
    handleSavePeriod, handleRemovePeriod, handleSave,
  };
}