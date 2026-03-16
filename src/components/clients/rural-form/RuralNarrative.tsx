import React from "react";
import { PenTool } from "lucide-react";

interface RuralNarrativeProps {
  historico: string;
  setHistorico: (value: string) => void;
}

export function RuralNarrative({ historico, setHistorico }: RuralNarrativeProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
        <PenTool size={20} className="text-emerald-500" /> Narrativa Rural
      </h3>
      <div>
        <label className="text-xs font-bold text-slate-500 mb-1 block">Histórico de Locais / Narrativa</label>
        <textarea
          rows={6}
          value={historico}
          onChange={(e) => setHistorico(e.target.value)}
          className="w-full p-3 border rounded-lg text-sm outline-none focus:border-emerald-500 min-h-[150px]"
          placeholder="Descreva a história rural do cliente detalhadamente..."
        />
      </div>
    </div>
  );
}
