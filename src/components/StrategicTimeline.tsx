import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { Ruler, AlertTriangle, FileText } from 'lucide-react';
import type { Periodo } from '../hooks/useBenefitAnalysis';
import {
  addCalendarYears,
  compareDateOnly,
  countElapsedCalendarMonths,
  countUniqueCoveredMonths,
  isValidDateInterval,
  normalizeDateOnly,
} from '../lib/dateIntervals';

type TimelinePeriodo = Periodo & { num?: number | null };

interface StrategicTimelineProps {
  der: string;
  periodos: TimelinePeriodo[];
  clienteNome?: string; 
}

const toUtcTimestamp = (value: string): number | null => {
  const normalized = normalizeDateOnly(value);
  return normalized ? Date.parse(`${normalized}T00:00:00Z`) : null;
};

interface RulerState {
  clientKey: string;
  start: string;
  end: string;
}

const loadRulerState = (clientKey: string, der: string): RulerState => {
  const savedStart = localStorage.getItem(`ruler_start_${clientKey}`);
  const savedEnd = localStorage.getItem(`ruler_end_${clientKey}`);

  return {
    clientKey,
    start: savedStart && savedEnd ? savedStart : addCalendarYears(der, -15),
    end: savedStart && savedEnd ? savedEnd : der,
  };
};

export default function StrategicTimeline({ der, periodos, clienteNome = "Cliente" }: StrategicTimelineProps) {
  const [ruler, setRuler] = useState<RulerState>(() => loadRulerState(clienteNome, der));
  const activeRuler = ruler.clientKey === clienteNome ? ruler : loadRulerState(clienteNome, der);
  const rulerStart = activeRuler.start;
  const rulerEnd = activeRuler.end;

  useEffect(() => {
    if (rulerStart && rulerEnd) {
      localStorage.setItem(`ruler_start_${clienteNome}`, rulerStart);
      localStorage.setItem(`ruler_end_${clienteNome}`, rulerEnd);
    }
  }, [rulerStart, rulerEnd, clienteNome]);

  const rulerIsValid = isValidDateInterval(rulerStart, rulerEnd);
  const currentMonths = countElapsedCalendarMonths(rulerStart, rulerEnd);
  const isDiff180 = rulerIsValid && currentMonths === 180;

  const getLeftPercent = (dateStr: string) => {
    if (!dateStr || !rulerIsValid) return 0;
    const startMs = toUtcTimestamp(rulerStart);
    const endMs = toUtcTimestamp(rulerEnd);
    const currentMs = toUtcTimestamp(dateStr);
    if (startMs === null || endMs === null || currentMs === null || startMs === endMs) return 0;
    const percent = ((currentMs - startMs) / (endMs - startMs)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getWidthPercent = (startStr: string, endStr: string) => {
    if (!isValidDateInterval(startStr, endStr || startStr) || !rulerIsValid) return 0;
    const endSafe = endStr || startStr;
    const left = getLeftPercent(startStr);
    const right = getLeftPercent(endSafe);
    return Math.max(0, right - left);
  };

  const getBlockColorCode = (tipo: string) => {
    const t = (tipo || '').toLowerCase();
    if (t === 'rural') return '#10b981'; 
    if (t === 'beneficio') return '#f59e0b'; 
    if (t === 'urbano') return '#ef4444'; 
    if (t === 'lacuna') return '#cbd5e1'; 
    return '#2563eb'; 
  };

  const provasNumeradas = useMemo(() => {
    return (periodos || [])
      .filter(p => p.num)
      .sort((a, b) => compareDateOnly(a.dataExpedicao || a.inicio, b.dataExpedicao || b.inicio));
  }, [periodos]);

  const totalRuralMonths = useMemo(() => {
    const ruralIntervals = (periodos || [])
      .filter(p => (p.tipo || '').toLowerCase() === 'rural')
      .map(({ inicio, fim }) => ({ inicio, fim }));
    return countUniqueCoveredMonths(ruralIntervals);
  }, [periodos]);

  const ruralYears = Math.floor(totalRuralMonths / 12);
  const ruralRemainingMonths = totalRuralMonths % 12;
  const totalRuralText = `${ruralYears} anos e ${ruralRemainingMonths} meses (${totalRuralMonths} meses)`;

  const printStyle: CSSProperties = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

  const getNinetyMonthMarks = () => {
    if (currentMonths <= 0) return [];
    const rulerStartTimestamp = toUtcTimestamp(rulerStart);
    if (rulerStartTimestamp === null) return [];
    const numMarks = Math.floor(currentMonths / 90);
    const marks = [];
    for (let i = 1; i <= numMarks; i++) {
        const positionPercent = ((90 * i) / currentMonths) * 100;
        if (positionPercent < 98) { 
            const d = new Date(rulerStartTimestamp);
            d.setUTCMonth(d.getUTCMonth() + (90 * i));
            marks.push({ label: String(d.getUTCFullYear()), percent: positionPercent });
        }
    }
    return marks;
  };

  const ninetyMonthMarks = getNinetyMonthMarks();

  return (
    <div style={printStyle} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans my-6 print:shadow-none print:border-none print:m-0 print:overflow-visible">
      
      {/* BLOCO DO GRÁFICO: Evita quebra de página no meio da régua */}
      <div className="print:break-inside-avoid">
        
        <div className="hidden print:block border-b border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Linha do Tempo Rural</h1>
          <div className="flex justify-between mt-2 text-sm font-bold text-slate-700">
            <span>Segurado(a): {clienteNome}</span>
            <span>DER: {der?.split('-').reverse().join('/')}</span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Ruler className="text-emerald-600" /> Régua de Provas
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Visualização progressiva baseada na Súmula 14 da TNU (frações de 90 meses).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Início da Régua</label>
              <input 
                type="date" value={rulerStart} onChange={e => setRuler({ ...activeRuler, start: e.target.value })}
                className="text-xs border-none bg-slate-50 p-1.5 rounded font-medium outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <span className="text-slate-300">-</span>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Fim da Régua</label>
              <input 
                type="date" value={rulerEnd} onChange={e => setRuler({ ...activeRuler, end: e.target.value })}
                className="text-xs border-none bg-slate-50 p-1.5 rounded font-medium outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {!isDiff180 && rulerStart && rulerEnd && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800 font-bold print:hidden">
            <AlertTriangle size={14} className="text-amber-600" />
            {rulerIsValid
              ? `Atenção: o período selecionado tem ${currentMonths} meses. A carência rural padrão exige 180 meses.`
              : 'Atenção: o fim da régua deve ser igual ou posterior ao início.'}
          </div>
        )}

        <div className="mx-4 md:mx-8 mb-2 mt-8 print:mx-0 print:mt-0 print:mb-6 flex justify-center">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-8 py-3 rounded-2xl shadow-sm text-center print:bg-white print:border-2 print:border-emerald-800">
                <span className="block text-[10px] uppercase font-black tracking-widest opacity-80 mb-0.5">Total Rural sem Sobreposição</span>
                <span className="text-xl font-black">{totalRuralText}</span>
            </div>
        </div>

        {/* AJUSTE NA RÉGUA: print:min-w-0 e print:w-full para caber certinho na folha A4 e não espremer o flex */}
        <div className="p-8 overflow-x-auto print:overflow-visible print:px-6 print:py-4">
          <div className="min-w-[700px] print:min-w-0 print:w-full relative pt-10 pb-12">
            
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-200 rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 w-1 h-6 bg-slate-400 -translate-y-1/2 rounded-full"></div>
            <div className="absolute top-1/2 right-0 w-1 h-6 bg-slate-400 -translate-y-1/2 rounded-full"></div>

            {ninetyMonthMarks.map((mark, i) => (
               <div key={i}>
                   <div className="absolute top-1/2 w-1 h-6 bg-emerald-600 -translate-y-1/2 -translate-x-1/2 rounded-full z-10 shadow-sm" style={{ left: `${mark.percent}%` }}></div>
                   <div className="absolute -bottom-6 text-[10px] font-black text-emerald-700 uppercase -translate-x-1/2 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap z-10" style={{ left: `${mark.percent}%` }}>
                      {mark.label}
                   </div>
               </div>
            ))}

            <div className="absolute -bottom-2 left-0 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
              Início ({rulerStart?.split('-')[0]})
            </div>
            <div className="absolute -bottom-2 right-0 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
              Fim ({rulerEnd?.split('-')[0]})
            </div>

            {(periodos || []).map(p => {
              const left = getLeftPercent(p.inicio);
              const width = getWidthPercent(p.inicio, p.fim);
              
              const docDate = p.dataExpedicao || p.inicio;
              const leftDoc = getLeftPercent(docDate);
              
              const isProvaRetorno = (p.tipo || '').toLowerCase() === 'prova de retorno';
              const leftPos = isProvaRetorno ? leftDoc : left;

              return (
                <div key={p.id}>
                  {p.num && leftDoc >= 0 && leftDoc <= 100 && (
                    <div 
                      className="absolute top-1/2 flex flex-col items-center group z-30"
                      style={{ left: `${leftDoc}%`, transform: 'translateX(-50%) translateY(-130%)' }}
                    >
                      <div className="w-6 h-6 bg-indigo-600 border-2 border-white text-white rounded-full flex items-center justify-center text-xs font-black shadow-md z-20 print:border-indigo-800">
                        {p.num}
                      </div>
                      <div className="w-0.5 h-4 bg-indigo-400"></div>
                    </div>
                  )}
                  
                  {leftPos <= 100 && (leftPos + width) >= 0 && (
                    <div 
                      className={`absolute top-1/2 opacity-90 hover:opacity-100 transition-all shadow-sm cursor-help border border-black/10 ${isProvaRetorno ? 'h-8 z-20 rounded-none' : 'h-4 rounded-sm hover:scale-y-125 z-10'}`}
                      style={{ 
                        left: `${leftPos}%`, 
                        width: isProvaRetorno ? '6px' : `${Math.max(width, 0.5)}%`, 
                        transform: isProvaRetorno ? 'translateY(-50%) translateX(-50%)' : 'translateY(-50%)', 
                        backgroundColor: getBlockColorCode(p.tipo) 
                      }}
                      title={`${(p.tipo || '').toUpperCase()}: ${p.obs}\n(${p.inicio} a ${p.fim || p.inicio})`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-medium text-slate-600 justify-center print:bg-transparent print:border-slate-800 print:mt-4">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded print:border print:border-black"></div> Atividade Rural</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded print:border print:border-black"></div> Sem Atividade</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded print:border print:border-black"></div> Urbano</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded print:border print:border-black"></div> Benefício</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-8 bg-blue-600 rounded-sm print:border print:border-black" style={{ width: '6px' }}></div> Prova de Retorno</div>
        </div>
      </div>

      {provasNumeradas.length > 0 && (
        <div className="p-6 border-t border-slate-200 bg-white print:border-t-2 print:border-slate-800 mt-4">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase text-sm tracking-wide">
            <FileText size={18} className="text-indigo-600 print:text-black"/> Fundamentação das Provas Utilizadas
          </h3>
          <ul className="space-y-4">
            {provasNumeradas.map((prova) => {
              const isProvaRetorno = (prova.tipo || '').toLowerCase() === 'prova de retorno';
              const docTitle = isProvaRetorno ? 'Prova de Retorno' : (prova.linkedDocTitle || 'Prova Documental');
              const docLaw = (isProvaRetorno && !prova.law) ? 'art. 116, § 2º, V, da IN 128/2022' : prova.law;

              return (
                <li key={prova.id} className="flex items-start gap-4 print:break-inside-avoid print:mb-6" style={{ pageBreakInside: 'avoid' }}>
                  <div className="w-7 h-7 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-black print:bg-transparent print:border-2 print:border-black print:text-black">
                    {prova.num}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {docTitle} <span className="font-normal text-slate-500 text-xs ml-2">({(prova.dataExpedicao || prova.inicio)?.split('-').reverse().join('/')})</span>
                    </p>
                    {prova.obs && <p className="text-sm text-slate-600 font-medium">Ref: {prova.obs}</p>}
                    <p className="text-xs text-slate-500 mt-1 italic">
                      <span className="font-bold not-italic">Fundamento Legal:</span> {docLaw}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
