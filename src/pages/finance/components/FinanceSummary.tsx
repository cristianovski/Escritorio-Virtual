import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface FinanceSummaryProps {
  totals: {
    aReceber: number;
    atrasadas: number;
    pagas: number;
  };
  formatCurrency: (value: number) => string;
}

export function FinanceSummary({ totals, formatCurrency }: FinanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <DollarSign size={20} />
          <span className="font-semibold">Total a Receber</span>
        </div>
        <p className="text-2xl font-bold">{formatCurrency(totals.aReceber)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-amber-600 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Parcelas em Atraso</span>
        </div>
        <p className="text-2xl font-bold">{totals.atrasadas}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <CheckCircle size={20} />
          <span className="font-semibold">Parcelas Pagas</span>
        </div>
        <p className="text-2xl font-bold">{totals.pagas}</p>
      </div>
    </div>
  );
}
