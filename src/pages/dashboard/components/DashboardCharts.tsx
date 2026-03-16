import { PieChart, Filter, Search } from "lucide-react";

interface DashboardChartsProps {
  stats: {
    total: number;
    iniciar: number;
    andamento: number;
    finalizado: number;
  };
  pieData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}

export function DashboardCharts({
  stats,
  pieData,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-slate-400" />
          Distribuição de Processos
        </h3>
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            {/* Simulação de gráfico de pizza com CSS */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-blue-500 to-emerald-500"
                 style={{
                   background: `conic-gradient(
                     #f59e0b 0deg ${(stats.iniciar / stats.total) * 360}deg,
                     #3b82f6 ${(stats.iniciar / stats.total) * 360}deg ${((stats.iniciar + stats.andamento) / stats.total) * 360}deg,
                     #10b981 ${((stats.iniciar + stats.andamento) / stats.total) * 360}deg 360deg
                   )`
                 }}>
            </div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-700">{stats.total}</span>
            </div>
          </div>
          <div className="w-full space-y-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          Filtros e Pesquisa
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {["Todos", "A Iniciar", "Em Andamento", "Finalizado"].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
