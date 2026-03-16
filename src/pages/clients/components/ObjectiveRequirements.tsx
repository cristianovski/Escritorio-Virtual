import { Calculator, Activity, Heart, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { AnalysisResult } from "../../../utils/benefitRules";

interface ExtraParams {
  data_dii: string;
  is_acidente: boolean;
  data_obito: string;
  data_casamento: string;
  idade_conjuge_obito: number;
}

interface ObjectiveRequirementsProps {
  tempoRural: number;
  setTempoRural: (val: number) => void;
  tempoUrbano: number;
  setTempoUrbano: (val: number) => void;
  selectedBenefit: string;
  showDII: boolean;
  showPensao: boolean;
  extraParams: ExtraParams;
  setExtraParams: (params: ExtraParams) => void;
  resultado: AnalysisResult | null;
}

export function ObjectiveRequirements({
  tempoRural, setTempoRural,
  tempoUrbano, setTempoUrbano,
  selectedBenefit,
  showDII, showPensao,
  extraParams, setExtraParams,
  resultado
}: ObjectiveRequirementsProps) {
  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
        <Calculator size={16} /> 1. Requisitos Objetivos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">Tempo Rural (Anos)</label>
          <input
            type="number"
            value={tempoRural}
            onChange={e => setTempoRural(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2 font-bold text-emerald-700 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1 block">Tempo Urbano (Anos)</label>
          <input
            type="number"
            value={tempoUrbano}
            onChange={e => setTempoUrbano(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2 font-bold text-blue-700 outline-none focus:border-blue-500"
            disabled={selectedBenefit.includes('Rural') && !selectedBenefit.includes('Híbrida')}
          />
        </div>
      </div>

      {(showDII || showPensao) && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 animate-in fade-in">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
            {showDII ? <Activity size={14} /> : <Heart size={14} />} Dados Específicos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showDII && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Data Início Incapacidade (DII)</label>
                  <input
                    type="date"
                    value={extraParams.data_dii}
                    onChange={e => setExtraParams({ ...extraParams, data_dii: e.target.value })}
                    className="w-full p-2 border rounded bg-white text-sm"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={extraParams.is_acidente}
                      onChange={e => setExtraParams({ ...extraParams, is_acidente: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Acidente / Doença Grave?
                  </label>
                </div>
              </>
            )}
            {showPensao && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Data do Óbito</label>
                  <input
                    type="date"
                    value={extraParams.data_obito}
                    onChange={e => setExtraParams({ ...extraParams, data_obito: e.target.value })}
                    className="w-full p-2 border rounded bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Data Casamento</label>
                  <input
                    type="date"
                    value={extraParams.data_casamento}
                    onChange={e => setExtraParams({ ...extraParams, data_casamento: e.target.value })}
                    className="w-full p-2 border rounded bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Idade Viúvo(a)</label>
                  <input
                    type="number"
                    value={extraParams.idade_conjuge_obito}
                    onChange={e => setExtraParams({ ...extraParams, idade_conjuge_obito: Number(e.target.value) })}
                    className="w-full p-2 border rounded bg-white text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {resultado && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${resultado.status === 'aprovado' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : resultado.status === 'rejeitado' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          {resultado.status === 'aprovado' ? <CheckCircle size={20} /> : resultado.status === 'rejeitado' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
          <div className="flex-1">
            <span className="font-bold text-sm block mb-1">
              {resultado.status === 'aprovado' ? 'Viabilidade Técnica Confirmada' : resultado.status === 'rejeitado' ? 'Inviabilidade Detectada' : 'Pontos de Atenção'}
            </span>
            <ul className="text-xs opacity-90 space-y-1">
              {resultado.messages.map((m, i) => <li key={i}>• {m}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
