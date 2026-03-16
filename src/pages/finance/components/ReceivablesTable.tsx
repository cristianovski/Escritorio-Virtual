interface ReceivablesTableProps {
  installments: any[];
  formatCurrency: (value: number) => string;
  formatDate: (date: string) => string;
}

export function ReceivablesTable({
  installments,
  formatCurrency,
  formatDate,
}: ReceivablesTableProps) {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Contas a Receber</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-left">Parcela</th>
              <th className="p-3 text-left">Vencimento</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-500">
                  Nenhuma conta a receber
                </td>
              </tr>
            ) : (
              installments.map((inst) => (
                <tr key={inst.id} className="border-t border-slate-100">
                  <td className="p-3">{inst.responsibility?.client_id}</td>
                  <td className="p-3">{inst.responsibility?.descricao}</td>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
