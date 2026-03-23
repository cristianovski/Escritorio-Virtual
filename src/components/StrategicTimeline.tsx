import { useState, useEffect, useMemo } from 'react';
import { Ruler, AlertTriangle, FileText } from 'lucide-react';

interface StrategicTimelineProps {
  der: string;
  periodos: any[];
  documentos?: any[]; 
  clienteNome?: string; 
}

// Helpers Utilitários
const parseDate = (d: string) => new Date(`${d.split('T')[0]}T12:00:00`);

const diffMonths = (start: string, end: string) => {
  if (!start || !end) return 0;
  const d1 = parseDate(start);
  const d2 = parseDate(end);
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
};

// FIX: Adicionada a função diffDays para resolver o erro do Sentry
const diffDays = (start: string, end: string) => {
  if (!start || !end) return 0;
  const diffTime = Math.abs(parseDate(end).getTime() - parseDate(start).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const addYears = (date: string, years: number) => {
  if (!date) return '';
  const d = parseDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export default function StrategicTimeline({ der, periodos, clienteNome = "Cliente" }: StrategicTimelineProps) {
  const [rulerStart, setRulerStart] = useState('');
  const [rulerEnd, setRulerEnd] = useState('');

  useEffect(() => {
    if (der) {
      setRulerEnd(der);
      setRulerStart(addYears(der, -15));
    }
  }, [der]);

  const currentMonths = diffMonths(rulerStart, rulerEnd);
  const isDiff180 = currentMonths === 180;

  const getLeftPercent = (dateStr: string) => {
    if (!dateStr || !rulerStart || !rulerEnd) return 0;
    const startMs = parseDate(rulerStart).getTime();
    const endMs = parseDate(rulerEnd).getTime();
    const currentMs = parseDate(dateStr).getTime();
    let percent = ((currentMs - startMs) / (endMs - startMs)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getWidthPercent = (startStr: string, endStr: string) => {
    if (!startStr || !rulerStart || !rulerEnd) return 0;
    const endSafe = endStr || startStr;
    const left = getLeftPercent(startStr);
    const right = getLeftPercent(endSafe);
    return Math.max(0, right - left);
  };

  const getBlockColor = (tipo: string) => {
    if (tipo === 'rural') return 'bg-emerald-500'; // Verde
    if (tipo === 'beneficio') return 'bg-amber-500'; // Amarelo
    if (tipo === 'urbano') return 'bg-red-500'; // Vermelho
    if (tipo === 'lacuna') return 'bg-slate-300'; // Cinza
    return 'bg-blue-600'; // Azul (Prova)
  };

  const provasNumeradas = useMemo(() => {
    return (periodos || [])
      .filter(p => p.num)
      .sort((a, b) => parseDate(a.dataExpedicao || a.inicio).getTime() - parseDate(b.dataExpedicao || b.inicio).getTime());
  }, [periodos]);

  const printStyle = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any;

  return (
    <div style={printStyle} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans my-6 print:shadow-none print:border-none print:m-0">
      
      <div className="hidden print:block border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Linha do Tempo Rural</h1>
        <div className="flex justify-between mt-2 text-sm font-bold text-slate-700">
          <span>Segurado(a): {clienteNome}</span>
          <span>DER: {der?.split('-').reverse().join('/')}</span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Ruler className="text-emerald-600" /> Régua de Provas (180 Meses)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Visualização progressiva baseada na Súmula 14 da TNU (90 + 90 meses).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Início da Régua</label>
            <input 
              type="date" value={rulerStart} onChange={e => setRulerStart(e.target.value)}
              className="text-xs border-none bg-slate-50 p-1.5 rounded font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <span className="text-slate-300">-</span>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Fim da Régua</label>
            <input 
              type="date" value={rulerEnd} onChange={e => setRulerEnd(e.target.value)}
              className="text-xs border-none bg-slate-50 p-1.5 rounded font-medium outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {!isDiff180 && rulerStart && rulerEnd && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800 font-bold print:hidden">
          <AlertTriangle size={14} className="text-amber-600" />
          Atenção: O período selecionado tem {currentMonths} meses. A carência rural exige 180 meses (15 anos).
        </div>
      )}

      <div className="p-8 overflow-x-auto print:overflow-visible print:px-6 print:py-4">
        <div className="min-w-[700px] relative pt-10 pb-12">
          
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-200 rounded-full -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-1 h-6 bg-slate-400 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-emerald-600 -translate-y-1/2 -translate-x-1/2 rounded-full z-10 shadow-sm"></div>
          <div className="absolute top-1/2 right-0 w-1 h-6 bg-slate-400 -translate-y-1/2 rounded-full"></div>

          <div className="absolute -bottom-2 left-0 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
            Início ({rulerStart?.split('-')[0]})
          </div>
          <div className="absolute -bottom-6 left-1/2 text-xs font-black text-emerald-700 uppercase -translate-x-1/2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 whitespace-nowrap z-10 print:border-emerald-800">
            Metade (90 Meses)
          </div>
          <div className="absolute -bottom-2 right-0 text-[10px] font-black text-slate-400 uppercase whitespace-nowrap">
            Fim ({rulerEnd?.split('-')[0]})
          </div>

          {(periodos || []).map(p => {
            const left = getLeftPercent(p.inicio);
            const width = getWidthPercent(p.inicio, p.fim);
            
            const docDate = p.dataExpedicao || p.inicio;
            const leftDoc = getLeftPercent(docDate);

            return (
              <div key={p.id}>
                {p.num && leftDoc >= 0 && leftDoc <= 100 && (
                  <div 
                    className="absolute top-1/2 flex flex-col items-center group z-30"
                    style={{ left: `${leftDoc}%`, transform: 'translateX(-50%) translateY(-130%)' }}
                  >
                    <div className="w-6 h-6 bg-blue-600 border-2 border-white text-white rounded-full flex items-center justify-center text-xs font-black shadow-md z-20 print:border-blue-800">
                      {p.num}
                    </div>
                    <div className="w-0.5 h-4 bg-blue-400"></div>
                  </div>
                )}
                
                {p.tipo !== 'prova de retorno' && left <= 100 && (left + width) >= 0 && (
                  <div 
                    className={`absolute top-1/2 h-4 ${getBlockColor(p.tipo)} rounded-sm opacity-90 hover:opacity-100 hover:scale-y-125 transition-all shadow-sm z-10 cursor-help border border-black/10`}
                    style={{ left: `${left}%`, width: `${width}%`, transform: 'translateY(-50%)' }}
                    title={`${p.tipo.toUpperCase()}: ${p.obs}\n(${p.inicio} a ${p.fim})`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-medium text-slate-600 justify-center print:bg-transparent print:border-slate-800">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded print:border print:border-black"></div> Atividade Rural</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded print:border print:border-black"></div> Sem Atividade</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded print:border print:border-black"></div> Urbano</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded print:border print:border-black"></div> Benefício</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600 rounded print:border print:border-black"></div> Prova de Retorno</div>
      </div>

      {provasNumeradas.length > 0 && (
        <div className="p-6 border-t border-slate-200 bg-white print:border-t-2 print:border-slate-800 mt-4">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 uppercase text-sm tracking-wide">
            <FileText size={18} className="text-blue-600 print:text-black"/> Fundamentação das Provas Utilizadas
          </h3>
          <ul className="space-y-4">
            {provasNumeradas.map((prova) => (
              <li key={prova.id} className="flex items-start gap-4">
                <div className="w-7 h-7 shrink-0 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-black print:bg-transparent print:border-2 print:border-black print:text-black">
                  {prova.num}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    {prova.linkedDocTitle || 'Prova Documental'} <span className="font-normal text-slate-500 text-xs ml-2">({(prova.dataExpedicao || prova.inicio)?.split('-').reverse().join('/')})</span>
                  </p>
                  {prova.obs && <p className="text-sm text-slate-600 font-medium">Ref: {prova.obs}</p>}
                  <p className="text-xs text-slate-500 mt-1 italic">
                    <span className="font-bold not-italic">Fundamento Legal:</span> {prova.law}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}