import { AlertCircle, Calendar } from "lucide-react";

interface TimelineEmptyStateProps {
  loading: boolean;
}

export function TimelineEmptyState({ loading }: TimelineEmptyStateProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
          <Calendar size={48} className="mb-4 opacity-20"/>
          <p>Consolidando história do cliente...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 text-center p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-slate-300" size={32}/>
        </div>
        <h3 className="text-slate-700 font-bold mb-1">Nenhum registro encontrado</h3>
        <p className="text-sm text-slate-400">Adicione provas através do botão GED no painel.</p>
    </div>
  );
}