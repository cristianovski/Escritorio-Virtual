import { useMemo } from 'react';
import { Clock, FileText, AlertTriangle } from 'lucide-react';

interface StrategicTimelineProps {
  der: string;
  periodos: any[];
  documentos: any[];
}

const parseDate = (d: string) => new Date(`${d}T00:00:00`);

const diffDays = (start: string, end: string) => {
  if (!start || !end) return 0;
  const diffTime = Math.abs(parseDate(end).getTime() - parseDate(start).getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const addYears = (date: string, years: number) => {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = parseDate(date);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export default function StrategicTimeline({ der, periodos, documentos }: StrategicTimelineProps) {
  const safeDer = der || new Date().toISOString().split('T')[0];
  const periodStart = addYears(safeDer, -15);
  const totalTimelineMonths = 180;

  // Processa os períodos inseridos na calculadora para o formato visual
  const processedBlocks = useMemo(() => {
    let isGracePeriodCut = false;

    // Ordena os períodos do mais antigo para o mais novo
    const sorted = [...(periodos || [])].sort((a, b) => 
      parseDate(a.inicio || '').getTime() - parseDate(b.inicio || '').getTime()
    );

    return sorted.map(p => {
      const days = diffDays(p.inicio, p.fim);
      let isValid = true;
      let uiColor = 'bg-slate-300'; // Default
      let tooltip = `${p.tipo.toUpperCase()}: ${p.obs || 'Sem observação'}`;

      if (p.tipo === 'urbano') {
        if (days <= 120 || p.is_safra) {
          uiColor = 'bg-amber-500'; // Alerta, não corta
          tooltip += `\nSafra urbana (${days} dias).`;
        } else {
          uiColor = 'bg-red-500'; // Corta a carência
          tooltip += `\nVínculo longo (${days} dias). Interrompe carência rural.`;
          isGracePeriodCut = true;
        }
      } 
      else if (p.tipo === 'rural' || p.tipo === 'beneficio') {
        if (isGracePeriodCut) {
          // Se houve corte urbano antes, verifica se esse período rural tem documento de retorno vinculado
          if (p.linkedDocId || p.tipo === 'prova de retorno') {
            isValid = true;
            uiColor = 'bg-emerald-500';
            tooltip += '\nRetorno ratificado válido.';
            isGracePeriodCut = false; // Recuperou
          } else {
            isValid = false;
            uiColor = 'bg-emerald-200 border-dashed border-2 border-emerald-400 opacity-50';
            tooltip += '\nINVÁLIDO: Falta prova de retorno pós-vínculo urbano longo.';
          }
        } else {
          uiColor = p.tipo === 'beneficio' ? 'bg-blue-400' : 'bg-emerald-500';
        }
      }

      return { ...p, days, isValid, uiColor, tooltip };
    });
  }, [periodos]);

  // Processa os documentos do GED para gerar os Halos de Eficácia
  const processedDocs = useMemo(() => {
    return (documentos || []).map(doc => {
      // Definimos um halo padrão de 24 meses (2 anos) para cada prova listada
      return {
        id: doc.id,
        date: doc.issueDate,
        title: doc.type,
        haloMonths: 24 
      };
    });
  }, [documentos]);

  const getPositionStyles = (dateStr: string, isDocument = false) => {
    if (!dateStr || dateStr === 'S/D') return { display: 'none' };
    const startMs = parseDate(periodStart).getTime();
    const endMs = parseDate(safeDer).getTime();
    const currentMs = parseDate(dateStr).getTime();
    
    let percent = ((currentMs - startMs) / (endMs - startMs)) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    return isDocument ? { left: `${percent}%`, transform: 'translateX(-50%)' } : { left: `${percent}%` };
  };

  const getWidthStyle = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { width: '0%' };
    const startMs = parseDate(periodStart).getTime();
    const endMs = parseDate(safeDer).getTime();
    const sMs = Math.max(parseDate(startStr).getTime(), startMs);
    const eMs = Math.min(parseDate(endStr).getTime(), endMs);
    
    let width = ((eMs - sMs) / (endMs - startMs)) * 100;
    if (width < 0) width = 0;
    return { width: `${width}%` };
  };

  if (!periodos || periodos.length === 0) {
    return null; // Não renderiza nada se não houver períodos
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans my-6">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="text-emerald-600" /> Canvas Estratégico (Visual Law)
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Projeção visual do período base de carência ({periodStart.split('-')[0]} a {safeDer.split('-')[0]})
        </p>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="min-w-[800px] relative pb-8 pt-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
            <span>{periodStart.split('-')[0]} (-15 Anos)</span>
            <span>DER ({safeDer.split('-')[0]})</span>
          </div>
          
          <div className="relative h-24 bg-slate-100 rounded-xl border-y border-slate-200">
            {/* DOCUMENTOS (Linhas Verticais e Halos) */}
            {processedDocs.map(doc => (
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

            {/* BLOCOS DA LINHA DO TEMPO */}
            {processedBlocks.map(block => (
              <div
                key={block.id}
                className={`absolute top-3 bottom-3 rounded-md transition-all flex items-center justify-center overflow-hidden shadow-sm ${block.uiColor}`}
                style={{
                  ...getPositionStyles(block.inicio),
                  ...getWidthStyle(block.inicio, block.fim)
                }}
                title={block.tooltip}
              >
                 {!block.isValid && block.tipo === 'rural' && (
                   <div className="text-white opacity-80 flex items-center justify-center">
                     <AlertTriangle size={14}/>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEGENDA LIMPA E MANUAL */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded"></div> Rural Válido</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div> Benefício</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded"></div> Urbano (≤120 dias)</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Urbano ({'>'}120 dias)</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-200 border border-dashed border-emerald-400 rounded"></div> Falta Retorno</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-300/40 blur-[2px] rounded"></div> Eficácia Prova (IR)</div>
      </div>
    </div>
  );
}