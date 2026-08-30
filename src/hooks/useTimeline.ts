import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';

export interface UnifiedTimelineItem {
  id: string | number;
  type: string;
  customName: string;
  issueDate: string;
  displayYear: string | number;
  fileUrl: string | null;
  fileName: string | null;
  source: string;
  law: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function readId(record: Record<string, unknown>, fallback: string): string | number {
  const value = record.id;
  return typeof value === 'string' || typeof value === 'number' ? value : fallback;
}

function displayYearFromDate(date: string): string | number {
  if (!date || date === 'S/D') return '?';
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : '?';
}

export function useTimeline(cliente: Client) {
  const clientId = cliente.id;
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<UnifiedTimelineItem[]>([]);

  useEffect(() => {
    if (!clientId) return;

    let active = true;

    const loadUnifiedTimeline = async () => {
      setLoading(true);
      let combinedDocs: UnifiedTimelineItem[] = [];

      try {
        const [interviewRes, clientRes, newDocsRes] = await Promise.all([
          supabase.from('interviews').select('timeline_json').eq('client_id', clientId).maybeSingle(),
          supabase.from('clients').select('personal_docs').eq('id', clientId).single(),
          supabase.from('client_documents').select('*').eq('client_id', clientId),
        ]);

        if (interviewRes.error) throw interviewRes.error;
        if (clientRes.error) throw clientRes.error;
        if (newDocsRes.error) throw newDocsRes.error;

        const interviewTimeline = interviewRes.data?.timeline_json;
        if (Array.isArray(interviewTimeline)) {
          const docsFicha = interviewTimeline.flatMap((value, index): UnifiedTimelineItem[] => {
            if (!isRecord(value)) return [];

            const year = readString(value, 'year');
            const issueDate = readString(value, 'issueDate') || (year ? `${year}-01-01` : 'S/D');

            return [{
              id: readId(value, `entrevista-${index}`),
              type: readString(value, 'type') || 'Registro Ficha',
              customName: readString(value, 'description'),
              issueDate,
              displayYear: year || displayYearFromDate(issueDate),
              fileUrl: readString(value, 'fileUrl') || null,
              fileName: readString(value, 'fileName') || null,
              source: 'Entrevista Rural',
              law: readString(value, 'law'),
            }];
          });
          combinedDocs = [...combinedDocs, ...docsFicha];
        }

        const personalDocs = clientRes.data?.personal_docs;
        if (Array.isArray(personalDocs)) {
          const docsCadastro = personalDocs.flatMap((value, index): UnifiedTimelineItem[] => {
            if (!isRecord(value)) return [];

            const category = readString(value, 'category');
            if (!category.toLowerCase().includes('prova')) return [];

            const issueDate = readString(value, 'issueDate');
            const fallbackDate = new Date().toISOString().slice(0, 10);

            return [{
              id: `ged-${index}`,
              type: category || 'Documento Pessoal',
              customName: readString(value, 'name') || 'Upload',
              issueDate: issueDate || fallbackDate,
              displayYear: displayYearFromDate(issueDate || fallbackDate),
              fileUrl: readString(value, 'url') || null,
              fileName: readString(value, 'fileName') || 'arquivo_anexo',
              source: 'GED / Cadastro',
              law: '',
            }];
          });
          combinedDocs = [...combinedDocs, ...docsCadastro];
        }

        if (newDocsRes.data) {
          const docsDb = newDocsRes.data.flatMap((document): UnifiedTimelineItem[] => {
            const category = document.category || '';
            if (!category.toLowerCase().includes('prova')) return [];

            const issueDate = document.reference_date || document.created_at || 'S/D';

            return [{
              id: document.id,
              type: category || 'Geral',
              customName: document.title || 'Sem Título',
              issueDate,
              displayYear: displayYearFromDate(issueDate),
              fileUrl: document.file_url || null,
              fileName: document.title || 'arquivo',
              source: 'GED (Novo)',
              law: '',
            }];
          });
          combinedDocs = [...combinedDocs, ...docsDb];
        }

        const sorted = [...combinedDocs].sort((a, b) => {
          const dateA = new Date(a.issueDate === 'S/D' ? '1900-01-01' : a.issueDate).getTime();
          const dateB = new Date(b.issueDate === 'S/D' ? '1900-01-01' : b.issueDate).getTime();
          return dateA - dateB;
        });

        if (active) setTimeline(sorted);
      } catch (error: unknown) {
        console.error('Erro ao carregar timeline:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadUnifiedTimeline();

    return () => {
      active = false;
    };
  }, [clientId]);

  return { loading, timeline };
}
