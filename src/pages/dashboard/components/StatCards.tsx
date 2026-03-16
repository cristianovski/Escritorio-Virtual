import { Users, AlertCircle, Clock, CheckCircle } from "lucide-react";

interface StatCardsProps {
  stats: {
    total: number;
    iniciar: number;
    andamento: number;
    finalizado: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <Users size={24} />
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Total</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
        <p className="text-sm text-slate-500 mt-1">Clientes cadastrados</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
            <AlertCircle size={24} />
          </div>
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{stats.iniciar}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">A Iniciar</h3>
        <p className="text-sm text-slate-500 mt-1">Aguardando análise</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Clock size={24} />
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{stats.andamento}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Em Andamento</h3>
        <p className="text-sm text-slate-500 mt-1">Processos ativos</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stats.finalizado}</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Finalizados</h3>
        <p className="text-sm text-slate-500 mt-1">Concluídos</p>
      </div>
    </div>
  );
}
