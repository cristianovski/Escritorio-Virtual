import { AlertCircle, ExternalLink, FileText, Folder } from "lucide-react";
import { UnifiedTimelineItem } from "../../../hooks/useTimeline";

interface TimelineItemProps {
  item: UnifiedTimelineItem;
  idx: number;
}

export function TimelineItem({ item, idx }: TimelineItemProps) {
  const fileExt = item.fileName?.includes('.') ? item.fileName.split('.').pop()?.toUpperCase() : "DOC";
  const isEven = idx % 2 === 0;

  return (
    <div className={`relative flex items-center mb-12 ${isEven ? 'md:flex-row-reverse' : ''} group`}>

        {/* ANO (NÓ CENTRAL) */}
        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-white border-4 border-slate-100 rounded-2xl flex flex-col items-center justify-center z-10 shadow-lg group-hover:scale-110 group-hover:border-emerald-100 transition-all duration-300">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Ano</span>
            <span className="text-sm font-black text-slate-700 leading-none">{item.displayYear}</span>
        </div>

        <div className={`w-full md:w-[45%] pl-20 md:pl-0 ${isEven ? 'md:pr-14' : 'md:pl-14'}`}>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">

                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.customName || item.type}</h4>
                        <div className="flex items-center gap-1 mt-1">
                            {item.source.includes('GED') ? <Folder size={10} className="text-blue-400"/> : <FileText size={10} className="text-amber-400"/>}
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{item.source}</span>
                        </div>
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-slate-200">{fileExt}</span>
                </div>

                {item.law && (
                    <div className="mb-4 p-2.5 bg-blue-50/50 rounded-xl text-[10px] text-blue-700 border border-blue-100/50 leading-relaxed">
                        <strong className="block mb-0.5 text-blue-800">Base Legal:</strong>
                        {item.law}
                    </div>
                )}

                {item.fileUrl ? (
                    <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-emerald-200"
                    >
                        <ExternalLink size={14}/> Abrir Documento
                    </a>
                ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-not-allowed">
                        <AlertCircle size={14}/> Apenas Registro (Sem Arquivo)
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}