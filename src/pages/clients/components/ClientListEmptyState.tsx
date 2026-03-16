import { LayoutList } from "lucide-react";

interface ClientListEmptyStateProps {
  onNewClient: () => void;
}

export function ClientListEmptyState({ onNewClient }: ClientListEmptyStateProps) {
  return (
    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
      <div className="bg-slate-50 p-4 rounded-full">
        <LayoutList size={40} className="text-slate-300" />
      </div>
      <div>
        <p className="text-slate-800 font-bold text-lg">Nenhum cliente encontrado.</p>
        <p className="text-slate-500 text-sm mb-4">Que tal cadastrar o primeiro agora?</p>
        <button
          onClick={onNewClient}
          className="text-emerald-600 font-bold hover:underline text-sm"
        >
          Cadastrar Cliente
        </button>
      </div>
    </div>
  );
}
