import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

interface CashFlowSummaryProps {
  totalReceber: number;
  totalPagar: number;
  saldoProjetado: number;
  formatCurrency: (value: number) => string;
}

export function CashFlowSummary({
  totalReceber,
  totalPagar,
  saldoProjetado,
  formatCurrency,
}: CashFlowSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <TrendingUp size={20} />
          <span className="font-semibold">A Receber (mês)</span>
        </div>
        <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalReceber)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <TrendingDown size={20} />
          <span className="font-semibold">A Pagar (mês)</span>
        </div>
        <p className="text-2xl font-bold text-red-700">{formatCurrency(totalPagar)}</p>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <DollarSign size={20} />
          <span className="font-semibold">Saldo Projetado</span>
        </div>
        <p className={`text-2xl font-bold ${saldoProjetado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
          {formatCurrency(saldoProjetado)}
        </p>
      </div>
    </div>
  );
}
