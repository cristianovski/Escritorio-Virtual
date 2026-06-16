import { MapPin, Phone, ChevronRight } from "lucide-react";
import { Client } from "../../../types";

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case 'Finalizado': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Em Andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all group hover:border-emerald-300 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-xl border border-slate-100 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-100 transition-colors">
          {client.nome ? client.nome.charAt(0).toUpperCase() : '?'}
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(client.status_processo as string)}`}>
          {client.status_processo || 'A Iniciar'}
        </span>
      </div>

      <h3 className="font-bold text-slate-800 mb-1 truncate text-lg group-hover:text-emerald-700 transition-colors">{client.nome}</h3>
      <p className="text-xs text-slate-400 font-mono mb-5 bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">{client.cpf}</p>

      <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-50 pt-4">
        <div className="flex items-center gap-2.5">
          <MapPin size={15} className="text-slate-400 shrink-0" />
          <span className="truncate text-xs font-medium">{client.cidade || client.endereco || 'Local não informado'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Phone size={15} className="text-slate-400 shrink-0" />
          <span className="truncate text-xs font-medium">{client.telefone || 'Sem telefone'}</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end text-slate-400 group-hover:text-emerald-600 font-bold text-xs items-center gap-1 transition-colors">
        Abrir Ficha <ChevronRight size={14} />
      </div>
    </div>
  );
}
