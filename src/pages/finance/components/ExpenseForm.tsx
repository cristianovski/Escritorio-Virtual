import { FinancialExpenseInput } from '../../../types/finance';

interface ExpenseFormProps {
  expenseForm: Partial<FinancialExpenseInput>;
  setExpenseForm: React.Dispatch<React.SetStateAction<Partial<FinancialExpenseInput>>>;
  setShowExpenseForm: (show: boolean) => void;
  handleCreateExpense: () => void;
}

export function ExpenseForm({
  expenseForm,
  setExpenseForm,
  setShowExpenseForm,
  handleCreateExpense,
}: ExpenseFormProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8">
      <h2 className="font-bold text-lg mb-4">Cadastrar Despesa</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição*</label>
          <input
            type="text"
            value={expenseForm.descricao}
            onChange={(e) => setExpenseForm({ ...expenseForm, descricao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria*</label>
          <select
            value={expenseForm.categoria}
            onChange={(e) => setExpenseForm({ ...expenseForm, categoria: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
          >
            <option value="Custas">Custas</option>
            <option value="Salários">Salários</option>
            <option value="Aluguel">Aluguel</option>
            <option value="Marketing">Marketing</option>
            <option value="Impostos">Impostos</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Valor*</label>
          <input
            type="number"
            step="0.01"
            value={expenseForm.valor}
            onChange={(e) => setExpenseForm({ ...expenseForm, valor: Number(e.target.value) })}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data Vencimento*</label>
          <input
            type="date"
            value={expenseForm.data_vencimento}
            onChange={(e) => setExpenseForm({ ...expenseForm, data_vencimento: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setShowExpenseForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg">
          Cancelar
        </button>
        <button onClick={handleCreateExpense} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
          Salvar
        </button>
      </div>
    </div>
  );
}
