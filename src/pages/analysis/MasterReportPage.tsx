import {
  ArrowLeft,
  Printer,
  CheckSquare,
  Square,
  FileText,
  Brain,
} from 'lucide-react';
import { useMasterReport } from '../../hooks/useMasterReport';
import { Client } from '../../types';
import { ReportCover } from '../../components/analysis/ReportCover';
import { ReportSummary } from '../../components/analysis/ReportSummary';
import { ReportAnalysis } from '../../components/analysis/ReportAnalysis';
import { ReportOpinion } from '../../components/analysis/ReportOpinion';
import { ReportProxy } from '../../components/analysis/ReportProxy';

interface ReportProps {
  cliente: Client;
  onBack: () => void;
}

export function MasterReportPage({ cliente, onBack }: ReportProps) {
  const {
    loading,
    interview,
    periods,
    officeProfile,
    stats,
    aiSummary,
    generatingSummary,
    sections,
    generateAiSummary,
    toggleSection,
    formatDate,
    getStart,
    getEnd,
  } = useMasterReport(cliente);

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <div className="p-10 text-center text-slate-500">Montando Dossiê...</div>;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col font-sans">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-xl print:hidden flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-blue-400" /> Dossiê Master
            </h1>
            <p className="text-xs text-slate-400">{cliente.nome}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition-all"
        >
          <Printer size={18} /> Imprimir Dossiê
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden print:overflow-visible">
        {/* Barra lateral de configuração (não imprime) */}
        <aside className="w-64 bg-white border-r border-slate-300 p-4 overflow-y-auto hidden md:block print:hidden shadow-lg z-10">
          <h3 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider border-b pb-2">Seções do Relatório</h3>
          <div className="space-y-2">
            {Object.entries(sections).map(([key, isVisible]) => (
              <button
                key={key}
                onClick={() => toggleSection(key as keyof typeof sections)}
                className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg text-sm text-slate-700 transition"
              >
                {isVisible ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
          <div className="mt-8 pt-4 border-t border-slate-200">
            <button
              onClick={generateAiSummary}
              disabled={generatingSummary}
              className="w-full bg-purple-100 hover:bg-purple-200 text-purple-800 p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Brain size={14} /> {generatingSummary ? 'Gerando...' : 'Gerar Resumo IA'}
            </button>
          </div>
        </aside>

        {/* Área de impressão */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center print:p-0 print:block">
          <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full mx-auto relative text-black text-[11pt] leading-relaxed">
            {/* Capa */}
            {sections.capa && (
              <ReportCover
                cliente={cliente}
                dataHoje={dataHoje}
                officeProfile={officeProfile}
              />
            )}

            {/* Dados cadastrais e resumo */}
            {(sections.dados_cadastrais || sections.resumo_ia) && (
              <ReportSummary
                cliente={cliente}
                interview={interview}
                aiSummary={aiSummary}
                formatDate={formatDate}
                showDadosCadastrais={sections.dados_cadastrais}
                showResumoIa={sections.resumo_ia}
              />
            )}

            {/* Análise matemática */}
            {sections.tabela_periodos && (
              <ReportAnalysis
                stats={stats}
                periods={periods}
                formatDate={formatDate}
                getStart={getStart}
                getEnd={getEnd}
              />
            )}

            {/* Parecer jurídico */}
            {sections.parecer && (
              <ReportOpinion
                cliente={cliente}
                officeProfile={officeProfile}
              />
            )}

            {/* Procuração (opcional) */}
            {sections.procuracao && (
              <ReportProxy
                cliente={cliente}
                dataHoje={dataHoje}
                officeProfile={officeProfile}
              />
            )}
          </div>
        </main>

        {/* CSS de impressão */}
        <style>{`
          @media print {
            @page {
              margin: 1.5cm;
              size: A4;
            }
            body {
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .page-break-after {
              break-after: page;
              page-break-after: always;
            }
            .page-break-before {
              break-before: page;
              page-break-before: always;
            }
            .no-break {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            ::-webkit-scrollbar {
              display: none;
            }
            aside {
              display: none !important;
            }
            main {
              padding: 0 !important;
              background: white !important;
            }
            div {
              box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}