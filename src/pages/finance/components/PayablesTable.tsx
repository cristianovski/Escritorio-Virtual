import { FinancialExpense } from '../../../types/finance';

interface PayablesTableProps {
  expenses: FinancialExpense[];
  handlePayExpense: (id: number) => void;
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

export function PayablesTable({
  expenses,
  handlePayExpense,
  formatCurrency,
  formatDate,
}: PayablesTableProps) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Contas a Pagar</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-left">Categoria</th>
              <th className="p-3 text-left">Vencimento</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  Nenhuma despesa cadastrada
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-t border-slate-100">
                  <td className="p-3">{exp.descricao}</td>
                  <td className="p-3">{exp.categoria}</td>
                  <td className="p-3">{formatDate(exp.data_vencimento)}</td>
                  <td className="p-3 font-medium">{formatCurrency(exp.valor)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exp.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {exp.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-3">
                    {exp.status !== 'pago' && (
                      <button
                        onClick={() => handlePayExpense(exp.id)}
                        className="text-emerald-600 hover:text-emerald-800 font-medium text-xs"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
