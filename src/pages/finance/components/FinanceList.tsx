import { Eye, Upload } from 'lucide-react';
import { FinancialResponsibility, FinancialInstallment } from '../../../types/finance';

interface FinanceListProps {
  responsibilities: FinancialResponsibility[];
  installments: FinancialInstallment[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
  handlePayInstallment: (installment: FinancialInstallment) => void;
}

export function FinanceList({
  responsibilities,
  installments,
  formatCurrency,
  formatDate,
  handlePayInstallment,
}: FinanceListProps) {
  if (responsibilities.length === 0) {
    return <p className="text-center text-slate-500 py-8">Nenhuma obrigação financeira cadastrada.</p>;
  }

  return (
    <div className="space-y-6">
      {responsibilities.map((resp) => (
        <div key={resp.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b">
            <h3 className="font-bold text-slate-800">{resp.descricao}</h3>
            <p className="text-sm text-slate-600">
              Total: {formatCurrency(resp.valor_total)} | Início: {formatDate(resp.data_inicio)}
            </p>
            {resp.observacoes && <p className="text-xs text-slate-500 mt-1">{resp.observacoes}</p>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left">Parcela</th>
                  <th className="p-3 text-left">Vencimento</th>
                  <th className="p-3 text-left">Valor</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Pagamento</th>
                  <th className="p-3 text-left">Comprovante</th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {installments
                  .filter((i) => i.responsibility_id === resp.id)
                  .map((inst) => (
                    <tr key={inst.id} className="border-t border-slate-100">
                      <td className="p-3">{inst.numero_parcela || '-'}</td>
                      <td className="p-3">{formatDate(inst.data_vencimento)}</td>
                      <td className="p-3 font-medium">{formatCurrency(inst.valor_previsto)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            inst.status === 'pago'
                              ? 'bg-emerald-100 text-emerald-700'
                              : inst.status === 'atrasado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {inst.status === 'pago' ? 'Pago' : inst.status === 'atrasado' ? 'Atrasado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3">{inst.data_pagamento ? formatDate(inst.data_pagamento) : '-'}</td>
                      <td className="p-3">
                        {inst.comprovante_id ? (
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye size={16} />
                          </button>
                        ) : (
                          <button className="text-slate-400 hover:text-slate-600" title="Anexar comprovante">
                            <Upload size={16} />
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        {inst.status !== 'pago' && (
                          <button
                            onClick={() => handlePayInstallment(inst)}
                            className="text-emerald-600 hover:text-emerald-800 font-medium text-xs"
                          >
                            Marcar pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
