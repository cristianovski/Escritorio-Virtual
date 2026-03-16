interface FinanceFormData {
  descricao: string;
  valor_total: string;
  tipo: 'parcelado_fixo' | 'exito' | 'ambos';
  numero_parcelas: string;
  data_inicio: string;
  observacoes: string;
}

interface FinanceFormProps {
  formData: FinanceFormData;
  setFormData: (data: FinanceFormData) => void;
  setShowForm: (show: boolean) => void;
  handleCreateResponsibility: () => void;
}

export function FinanceForm({
  formData,
  setFormData,
  setShowForm,
  handleCreateResponsibility,
}: FinanceFormProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-8">
      <h2 className="font-bold text-lg mb-4">Cadastrar Obrigação Financeira</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descrição*</label>
          <input
            type="text"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
            placeholder="Ex: Honorários advocatícios"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Valor Total*</label>
          <input
            type="number"
            step="0.01"
            value={formData.valor_total}
            onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo*</label>
          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            className="w-full border border-slate-300 rounded-lg p-2"
          >
            <option value="parcelado_fixo">Parcelado Fixo</option>
            <option value="exito">Êxito (único)</option>
            <option value="ambos">Parcelado + Êxito</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Número de Parcelas</label>
          <input
            type="number"
            value={formData.numero_parcelas}
            onChange={(e) => setFormData({ ...formData, numero_parcelas: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
            disabled={formData.tipo === 'exito'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data Início*</label>
          <input
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={3}
            className="w-full border border-slate-300 rounded-lg p-2"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-300 rounded-lg">
          Cancelar
        </button>
        <button onClick={handleCreateResponsibility} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
          Salvar
        </button>
      </div>
    </div>
  );
}
