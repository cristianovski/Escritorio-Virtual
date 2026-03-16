import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Calculator,
  ChevronDown,
} from 'lucide-react';
import { useBenefitAnalysis, Periodo } from '../../hooks/useBenefitAnalysis';
import { Client } from '../../types';

import { TotalCards } from '../../components/analysis/TotalCards';
import { SpecificParams } from '../../components/analysis/SpecificParams';
import { LegalAnalysisResult } from '../../components/analysis/LegalAnalysisResult';
import { PeriodForm } from '../../components/analysis/PeriodForm';
import { PeriodList } from '../../components/analysis/PeriodList';
import { DocumentsSidebar } from '../../components/analysis/DocumentsSidebar';

const BENEFIT_TYPES = [
  'Aposentadoria por Idade Rural',
  'Salário Maternidade Rural',
  'Aposentadoria Híbrida',
  'Auxílio por incapacidade temporária',
  'Auxílio por incapacidade permanente',
  'Pensão por morte',
];

interface AnalysisPageProps {
  cliente: Client;
  onBack: () => void;
}

export function AnalysisPage({ cliente, onBack }: AnalysisPageProps) {
  const {
    loading,
    der,
    setDer,
    selectedBenefit,
    setSelectedBenefit,
    periodos,
    documentos,
    extraParams,
    setExtraParams,
    analiseJuridica,
    totalRural,
    totalHibrido,
    handleSavePeriod,
    handleRemovePeriod,
    handleSave,
  } = useBenefitAnalysis(cliente);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Periodo>>({
    tipo: 'rural',
    inicio: '',
    fim: '',
    obs: '',
    linkedDocId: '',
    law: '',
  });

  const handleEditClick = (p: Periodo) => {
    setEditingId(p.id);
    setForm(p);
    document.getElementById('form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocId: '', law: '' });
  };

  const onSavePeriod = () => {
    handleSavePeriod(form, editingId);
    if (!editingId) {
      setForm({ tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocId: '', law: '' });
    } else {
      setEditingId(null);
      setForm({ tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocId: '', law: '' });
    }
  };

  const showDII = selectedBenefit.toLowerCase().includes('incapacidade');
  const showPensao = selectedBenefit.toLowerCase().includes('pensão');
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  const diffMonths = (d1: string, d2: string) => {
    if (!d1 || !d2) return 0;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()) + 1;
    return months > 0 ? months : 0;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="text-amber-600" /> Calculadora Estratégica
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{cliente.nome}</span>
              <span className="text-slate-300">|</span>
              <div className="relative group">
                <select
                  value={selectedBenefit}
                  onChange={(e) => setSelectedBenefit(e.target.value)}
                  className="appearance-none bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-1 pl-2 pr-8 rounded cursor-pointer outline-none border border-emerald-200 transition-colors"
                >
                  {BENEFIT_TYPES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1.5 text-emerald-600 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 disabled:opacity-50 w-full md:w-auto justify-center"
        >
          {loading ? 'Salvando...' : (
            <>
              <Save size={16} /> Salvar Análise
            </>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <TotalCards
            der={der}
            setDer={setDer}
            totalRural={totalRural}
            totalHibrido={totalHibrido}
          />

          <SpecificParams
            showDII={showDII}
            showPensao={showPensao}
            selectedBenefit={selectedBenefit}
            extraParams={extraParams}
            setExtraParams={setExtraParams}
          />

          <LegalAnalysisResult analiseJuridica={analiseJuridica} />

          <PeriodForm
            editingId={editingId}
            form={form}
            setForm={setForm}
            onSavePeriod={onSavePeriod}
            handleCancelEdit={handleCancelEdit}
          />

          <PeriodList
            periodos={periodos}
            diffMonths={diffMonths}
            fmtDate={fmtDate}
            handleEditClick={handleEditClick}
            handleRemovePeriod={handleRemovePeriod}
          />
        </div>

        <DocumentsSidebar documentos={documentos} />
      </main>
    </div>
  );
}
