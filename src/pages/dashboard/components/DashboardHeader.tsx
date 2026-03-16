import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 mt-1">Bem-vindo de volta! Aqui está o resumo da sua carteira.</p>
      </div>
      <button
        onClick={() => navigate('/cliente/novo')}
        className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-200/50 transition-all hover:shadow-xl hover:-translate-y-0.5"
      >
        <UserPlus size={20} />
        Novo Cliente
      </button>
    </div>
  );
}
