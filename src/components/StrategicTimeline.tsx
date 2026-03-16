// ARQUIVO: src/components/StrategicTimeline.tsx
import { useState, useMemo } from 'react';
import { 
  AlertTriangle, CheckCircle, Clock, 
  FileText, ShieldAlert, Plus, XCircle, Info, ChevronRight 
} from 'lucide-react';

type BlockType = 'Rural' | 'Urbano' | 'Urbano Familiar';

interface TimeBlock {
  id: string;
  startDate: string;
  endDate: string;
  type: BlockType;
  description: string;
  hasReturnDoc?: boolean;
}

interface RatifyingDoc {
  id: string;
  date: string;
  title: string;
  haloMonths: number;
}

interface TimelineState {
  der: string;
  blocks: TimeBlock[];
  documents: RatifyingDoc[];
}

const parseDate = (d: string) => new Date(`${d}T00:00:00`);

const diffDays = (start: string, end: string) => {
  const diffTime = Math.abs(parseDate(end).getTime() - parseDate(start).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const diffMonths = (start: string, end: string) => {
  const d1 = parseDate(start);
  const d2 = parseDate(end);
  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
};

const addYears = (date: string, years: number) => {
  const d = parseDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export default function StrategicTimeline() {
  const [state, setState] = useState<TimelineState>({
    der: '2024-01-01',
    blocks: [
      { id: 'b1', startDate: '2009-01-01', endDate: '2014-12-31', type: 'Rural', description: 'Sítio Boa Esperança' },
      { id: 'b2', startDate: '2015-01-01', endDate: '2015-03-31', type: 'Urbano', description: 'Colheita de Café (90 dias)' },
      { id: 'b3', startDate: '2015-04-01', endDate: '2018-05-31', type: 'Rural', description: 'Retorno ao Sítio' },
      { id: 'b4', startDate: '2018-06-01', endDate: '2019-02-28', type: 'Urbano', description: 'Auxiliar de Pedreiro' },
      { id: 'b5', startDate: '2019-03-01', endDate: '2023-12-31', type: 'Rural', description: 'Sítio Boa Esperança', hasReturnDoc: false },
      { id: 'b6', startDate: '2020-01-01', endDate: '2022-12-31', type: 'Urbano Familiar', description: 'Trabalho do Filho' }
    ],
    documents: [
      { id: 'd1', date: '2012-06-15', title: 'Certidão de Casamento', haloMonths: 36 },
      { id: 'd2', date: '2021-08-10', title: 'Nota Fiscal Agrícola', haloMonths: 24 }
    ]
  });

  const periodStart = addYears(state.der, -15);
  const totalTimelineMonths = 180;

  const processedData = useMemo(() => {
    let validRuralMonths = 0;
    let isGracePeriodCut = false;
    const alerts: string[] = [];

    const sortedBlocks = [...state.blocks].sort((a, b) => parseDate(a.startDate).getTime() - parseDate(b.startDate).getTime());

    const processedBlocks = sortedBlocks.map(block => {
      const days = diffDays(block.startDate, block.endDate);
      const months = diffMonths(block.startDate, block.endDate);
      let isValid = true;
      let uiColor = '';
      let warning = '';

      if (block.type === 'Urbano') {
        if (days <= 120) {
          uiColor = 'bg-amber-500';
          warning = `Safra urbana (${days} dias). Não interrompe carência.`;
        } else {
          uiColor = 'bg-red-500';
          warning = `Vínculo longo (${days} dias). Interrompe carência rural!`;
          isGracePeriodCut = true;
        }
      } 
      else if (block.type === 'Urbano Familiar') {
        uiColor = 'bg-indigo-400';
        warning = 'Súmula 41 TNU: Necessário provar indispensabilidade da renda rural.';
        if (!alerts.includes('Familiar Urbano detectado.')) alerts.push('Familiar Urbano detectado.');
      } 
      else if (block.type === 'Rural') {
        if (isGracePeriodCut) {
          if (block.hasReturnDoc) {
            isValid = true;
            uiColor = 'bg-emerald-500';
            warning = 'Retorno ratificado (Tema 301 TNU).';
            isGracePeriodCut = false;
          } else {
            isValid = false;
            uiColor = 'bg-emerald-200 border-dashed border-2 border-emerald-400 opacity-50';
            warning = 'INVÁLIDO. Falta prova de retorno após vínculo urbano longo!';
          }
        } else {
          uiColor = 'bg-emerald-500';
        }

        if (isValid) {
           const startEval = parseDate(block.startDate) < parseDate(periodStart) ? periodStart : block.startDate;
           const endEval = parseDate(block.endDate) > parseDate(state.der) ? state.der : block.endDate;
           if (parseDate(startEval) < parseDate(endEval)) {
             validRuralMonths += diffMonths(startEval, endEval);
           }
        }
      }

      return { ...block, days, months, isValid, uiColor, warning };
    });

    return { processedBlocks, validRuralMonths, alerts };
  }, [state]);

  const getPositionStyles = (dateStr: string, isDocument = false) => {
    const startMs = parseDate(periodStart).getTime();
    const endMs = parseDate(state.der).getTime();
    const currentMs = parseDate(dateStr).getTime();
    
    let percent = ((currentMs - startMs) / (endMs - startMs)) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    return isDocument ? { left: `${percent}%`, transform: 'translateX(-50%)' } : { left: `${percent}%` };
  };

  const getWidthStyle = (startStr: string, endStr: string) => {
    const startMs = parseDate(periodStart).getTime();
    const endMs = parseDate(state.der).getTime();
    const sMs = Math.max(parseDate(startStr).getTime(), startMs);
    const eMs = Math.min(parseDate(endStr).getTime(), endMs);
    
    let width = ((eMs - sMs) / (endMs - startMs)) * 100;
    if (width < 0) width = 0;
    return { width: `${width}%` };
  };

  const toggleReturnDoc = (id: string) => {
    setState(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, hasReturnDoc: !b.hasReturnDoc } : b)
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-emerald-600" /> Canvas Estratégico (Visual Law)
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Análise de 180 meses ({periodStart.split('-')[0]} a {state.der.split('-')[0]})
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Plus size={14}/> Bloco
          </button>
          <button className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-500 flex items-center gap-2 transition-colors">
            <FileText size={14}/> Prova (IR)
          </button>
        </div>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="min-w-[800px] relative pb-12 pt-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span>{periodStart.split('-')[0]} (-15 Anos)</span>
            <span>DER ({state.der.split('-')[0]})</span>
          </div>
          
          <div className="relative h-20 bg-slate-100 rounded-xl border-y border-slate-200 mb-6">
            {state.documents.map(doc => (
              <div 
                key={doc.id} 
                className="absolute top-0 bottom-0 z-10 flex flex-col items-center"
                style={getPositionStyles(doc.date, true)}
              >
                <div className="w-px h-full bg-emerald-400 relative z-20"></div>
                <div className="absolute -top-4 bg-emerald-100 border border-emerald-300 text-emerald-700 p-1 rounded shadow-sm z-20 tooltip" title={doc.title}>
                  <FileText size={12}/>
                </div>
                <div 
                  className="absolute h-full bg-emerald-300/30 blur-sm pointer-events-none"
                  style={{
                    width: `${(doc.haloMonths / totalTimelineMonths) * 100 * 2}%`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                ></div>
              </div>
            ))}

            {processedData.processedBlocks.filter(b => b.type !== 'Urbano Familiar').map(block => (
              <div
                key={block.id}
                className={`absolute top-2 bottom-2 rounded-md transition-all group flex items-center justify-center overflow-hidden shadow-sm ${block.uiColor}`}
                style={{
                  ...getPositionStyles(block.startDate),
                  ...getWidthStyle(block.startDate, block.endDate)
                }}
                title={`${block.type}: ${block.description}\n${block.warning}`}
              >
                 {!block.isValid && block.type === 'Rural' && (
                   <button 
                     onClick={() => toggleReturnDoc(block.id)}
                     className="absolute inset-0 m-auto bg-slate-900/80 text-white text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                   >
                     <AlertTriangle size={14} className="text-amber-400 mb-1"/>
                     Anexar Retorno
                   </button>
                 )}
              </div>
            ))}
          </div>

          {/* Trilha Grupo Familiar */}
          <div className="relative h-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed flex items-center px-2 mt-4">
             <span className="absolute -left-32 text-xs font-bold text-slate-400 flex items-center gap-1">
               <ShieldAlert size={12}/> Grupo Familiar
             </span>
             {processedData.processedBlocks.filter(b => b.type === 'Urbano Familiar').map(block => (
              <div
                key={block.id}
                className={`absolute top-1 bottom-1 rounded-md shadow-sm opacity-80 ${block.uiColor}`}
                style={{
                  ...getPositionStyles(block.startDate),
                  ...getWidthStyle(block.startDate, block.endDate)
                }}
                title={`${block.type}: ${block.description}\n${block.warning}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Rural Válido</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded"></div> Urbano (≤120 dias)</div>
        {/* CORREÇÃO DO JSX NA LINHA ABAIXO */}
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Urbano ({'>'}120 dias)</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-400 rounded"></div> Familiar</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-200 border border-dashed border-emerald-400 rounded"></div> Falta Retorno</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-300/40 blur-[2px] rounded"></div> Eficácia Prova</div>
      </div>

      {/* Painel de Resultado no Bottom */}
      <div className="p-6 border-t border-slate-200">
        {processedData.validRuralMonths >= totalTimelineMonths ? (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl flex items-start gap-4">
             <CheckCircle className="text-emerald-600 mt-1" size={24} />
             <div>
               <h2 className="text-lg font-bold text-emerald-900">Viabilidade Alta: Aposentadoria por Idade Rural</h2>
               <p className="text-emerald-800 text-sm mt-1">O segurado atinge os 180 meses de carência estritamente necessários.</p>
               <span className="inline-block mt-2 text-xs font-bold bg-white text-emerald-700 px-3 py-1 rounded-md border border-emerald-200 shadow-sm">
                 {processedData.validRuralMonths} Meses Validados
               </span>
             </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl flex items-start gap-4">
             <Info className="text-blue-600 mt-1" size={24} />
             <div className="w-full">
               <h2 className="text-lg font-bold text-blue-900">Carência Insuficiente (Especial Puro)</h2>
               <p className="text-blue-800 text-sm mt-1">Foram computados apenas <strong className="text-base">{processedData.validRuralMonths}</strong> meses rurais puros válidos.</p>
               
               <div className="mt-3 bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1 mb-1">
                    <ChevronRight size={14} className="text-blue-500"/> Sugestão: Aposentadoria Híbrida
                  </h4>
                  <p className="text-xs text-blue-800">Tema 1007 do STJ. Soma-se o rural ao urbano (requisito: 65H/62M).</p>
               </div>
               {processedData.alerts.length > 0 && (
                 <ul className="mt-3 space-y-1">
                   {processedData.alerts.map((al, idx) => (
                     <li key={idx} className="text-xs font-bold text-red-600 flex items-center gap-1"><XCircle size={12}/> {al}</li>
                   ))}
                 </ul>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}