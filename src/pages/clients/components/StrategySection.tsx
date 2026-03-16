import { BookOpen, Sparkles, BrainCircuit, FileText, Save } from "lucide-react";
import { AnalysisResult } from "../../../utils/benefitRules";

interface StrategySectionProps {
  theses: any[];
  selectedThesisId: string;
  setSelectedThesisId: (id: string) => void;
  handleGenerateOpinion: () => void;
  generating: boolean;
  resultado: AnalysisResult | null;
  parecerIA: string;
  lastAnalysisDate: string | null;
}

export function StrategySection({
  theses,
  selectedThesisId,
  setSelectedThesisId,
  handleGenerateOpinion,
  generating,
  resultado,
  parecerIA,
  lastAnalysisDate
}: StrategySectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-bold text-emerald-400 uppercase mb-1 flex items-center gap-2">
              <BookOpen size={12} /> Estratégia / Tese Jurídica
            </label>
            <select
              value={selectedThesisId}
              onChange={e => setSelectedThesisId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-3 outline-none focus:border-emerald-500 cursor-pointer"
            >
              {theses.length === 0 && <option value="">Nenhuma tese encontrada na biblioteca...</option>}
              {theses.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateOpinion}
            disabled={generating || resultado?.status === 'rejeitado' || theses.length === 0}
            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {generating ? <Sparkles className="animate-spin" /> : <BrainCircuit />}
            {generating ? "Analisando..." : "Gerar Parecer IA"}
          </button>
        </div>
      </div>

      {/* ÁREA DO RESULTADO (PARECER) */}
      {parecerIA && (
        <div className="bg-white p-8 rounded-2xl border-l-4 border-emerald-500 shadow-lg animate-in fade-in slide-in-from-bottom-4 relative">
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2"><FileText /> Parecer Técnico</h3>
              <p className="text-xs text-slate-500 mt-1">
                Gerado em: {lastAnalysisDate ? new Date(lastAnalysisDate).toLocaleString('pt-BR') : 'Agora'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold flex items-center gap-1"><Save size={10} /> Salvo</span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line font-medium leading-relaxed">
            {parecerIA}
          </div>
        </div>
      )}
    </div>
  );
}
