import { ArrowLeft, BrainCircuit } from "lucide-react";
import { Client } from "../../types";
import { BENEFIT_TYPES, useLegalOpinion } from "./hooks/useLegalOpinion";
import { ObjectiveRequirements } from "./components/ObjectiveRequirements";
import { DocumentsSection } from "./components/DocumentsSection";
import { StrategySection } from "./components/StrategySection";

interface LegalOpinionPageProps {
  cliente: Client;
  onBack: () => void;
}

export function LegalOpinionPage({ cliente, onBack }: LegalOpinionPageProps) {
  const {
    client,
    loading,
    generating,
    parecerIA,
    lastAnalysisDate,
    documents,
    selectedDocs,
    failedDocs,
    ocrTexts,
    showOcr,
    theses,
    selectedThesisId,
    tempoRural,
    tempoUrbano,
    selectedBenefit,
    extraParams,
    resultado,
    setShowOcr,
    setSelectedThesisId,
    setTempoRural,
    setTempoUrbano,
    setSelectedBenefit,
    setExtraParams,
    toggleDoc,
    handleGenerateOpinion
  } = useLegalOpinion(cliente);

  const showDII = selectedBenefit.toLowerCase().includes("incapacidade");
  const showPensao = selectedBenefit.toLowerCase().includes("pensão") || selectedBenefit.toLowerCase().includes("morte");

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>;

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft className="text-slate-600"/></button>
        <div>
           <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <BrainCircuit className="text-purple-600"/> Análise IA & Viabilidade
           </h1>
           <p className="text-xs text-slate-500">Versão DeepSeek • Documentos analisados</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        
        {/* DADOS BÁSICOS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{client?.nome}</h2>
                <p className="text-slate-500 text-sm">CPF: {client?.cpf} • {client?.profissao}</p>
            </div>
            <select 
                value={selectedBenefit}
                onChange={(e) => setSelectedBenefit(e.target.value)}
                className="bg-purple-50 border border-purple-200 text-purple-900 font-bold py-2 px-4 rounded-lg outline-none cursor-pointer"
            >
                 {BENEFIT_TYPES.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                 ))}
             </select>
        </div>

        {/* 1. REQUISITOS OBJETIVOS */}
        <ObjectiveRequirements
          tempoRural={tempoRural}
          setTempoRural={setTempoRural}
          tempoUrbano={tempoUrbano}
          setTempoUrbano={setTempoUrbano}
          selectedBenefit={selectedBenefit}
          showDII={showDII}
          showPensao={showPensao}
          extraParams={extraParams}
          setExtraParams={setExtraParams}
          resultado={resultado}
        />

        {/* 2. DOCUMENTOS DO GED */}
        <DocumentsSection
          documents={documents}
          failedDocs={failedDocs}
          selectedDocs={selectedDocs}
          toggleDoc={toggleDoc}
          ocrTexts={ocrTexts}
          showOcr={showOcr}
          setShowOcr={setShowOcr}
        />

        {/* 3. SELEÇÃO DA TESE & GERAÇÃO */}
        <StrategySection
          theses={theses}
          selectedThesisId={selectedThesisId}
          setSelectedThesisId={setSelectedThesisId}
          handleGenerateOpinion={handleGenerateOpinion}
          generating={generating}
          resultado={resultado}
          parecerIA={parecerIA}
          lastAnalysisDate={lastAnalysisDate}
        />
      </main>
    </div>
  );
}
