import { ArrowLeft, Clock, Search } from "lucide-react";

interface TimelineHeaderProps {
  filter: string;
  setFilter: (value: string) => void;
  onBack: () => void;
}

export function TimelineHeader({ filter, setFilter, onBack }: TimelineHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-emerald-200 rounded-xl transition-all text-slate-500 hover:text-emerald-600 shadow-sm">
                  <ArrowLeft size={20}/>
              </button>
              <div>
                  <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      Linha do Tempo
                  </h1>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Clock size={12}/> Visualização Cronológica Unificada
                  </p>
              </div>
          </div>

          <div className="relative w-full md:w-72 group">
              <Search size={18} className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors"/>
              <input
                  type="text"
                  placeholder="Buscar documento, ano ou tipo..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
          </div>
      </div>
    </header>
  );
}