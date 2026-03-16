import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface ReportAnalysisProps {
  stats: { rural: number; carencia: number };
  periods: Array<{ inicio?: string; fim?: string; is_safra?: boolean; tipo?: string; obs?: string }>;
  formatDate: (dateString?: string | null) => string;
  getStart: (p: any) => string;
  getEnd: (p: any) => string;
}

export function ReportAnalysis({ stats, periods, formatDate, getStart, getEnd }: ReportAnalysisProps) {
  return (
    <div className="p-[20mm] page-break-after">
      <h2 className="text-2xl font-black border-b-2 border-slate-900 pb-2 mb-6 uppercase flex items-center gap-2">
        <TrendingUp size={24} /> Análise Matemática
      </h2>
      <div className="flex gap-4 mb-8">
        <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 text-center rounded-xl">
          <span className="block text-xs font-bold text-emerald-800 uppercase mb-1">Cálculo Rural</span>
          <span className="text-3xl font-black text-emerald-600">
            {stats.rural} <span className="text-sm font-normal">meses</span>
          </span>
        </div>
        <div className="flex-1 bg-blue-50 border border-blue-200 p-4 text-center rounded-xl">
          <span className="block text-xs font-bold text-blue-800 uppercase mb-1">Carência Total</span>
          <span className="text-3xl font-black text-blue-600">
            {stats.carencia} <span className="text-sm font-normal">meses</span>
          </span>
        </div>
        <div className="flex-1 bg-slate-100 border border-slate-300 p-4 text-center rounded-xl flex flex-col justify-center items-center">
          {stats.rural >= 180 ? (
            <>
              <CheckCircle size={24} className="text-emerald-500 mb-1" />
              <span className="text-xs font-bold text-emerald-700">CARÊNCIA RURAL ATINGIDA</span>
            </>
          ) : (
            <>
              <AlertTriangle size={24} className="text-amber-500 mb-1" />
              <span className="text-xs font-bold text-amber-700">CARÊNCIA PENDENTE</span>
            </>
          )}
        </div>
      </div>
      <h3 className="font-bold text-sm mb-2 uppercase">Memória de Cálculo (Linha do Tempo)</h3>
      <table className="w-full text-[9pt] border-collapse">
        <thead>
          <tr className="bg-slate-200 text-left">
            <th className="border border-slate-400 p-2">Tipo</th>
            <th className="border border-slate-400 p-2 text-center">Início</th>
            <th className="border border-slate-400 p-2 text-center">Fim</th>
            <th className="border border-slate-400 p-2">Observação</th>
          </tr>
        </thead>
        <tbody>
          {(!periods || periods.length === 0) ? (
            <tr>
              <td colSpan={4} className="border border-slate-400 p-4 text-center italic text-slate-500">
                Nenhum período cadastrado na calculadora.
              </td>
            </tr>
          ) : (
            periods.map((p, i) => (
              <tr
                key={i}
                className={p.tipo === 'rural' ? 'bg-emerald-50/30' : p.tipo === 'urbano' ? 'bg-red-50/30' : 'bg-white'}
              >
                <td className="border border-slate-400 p-2 font-bold uppercase">
                  {p.tipo} {p.is_safra ? '(Safra)' : ''}
                </td>
                <td className="border border-slate-400 p-2 text-center">{formatDate(getStart(p))}</td>
                <td className="border border-slate-400 p-2 text-center">{formatDate(getEnd(p))}</td>
                <td className="border border-slate-400 p-2 text-xs">{p.obs || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
