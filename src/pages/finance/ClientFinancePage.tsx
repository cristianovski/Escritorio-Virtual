import { useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientFinance } from '../../hooks/useClientFinance';
import { FinanceSummary } from './components/FinanceSummary';
import { FinanceForm } from './components/FinanceForm';
import { FinanceList } from './components/FinanceList';

export function ClientFinancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = Number(id);

  const {
    client,
    responsibilities,
    installments,
    loading,
    showForm,
    setShowForm,
    formData,
    setFormData,
    totals,
    formatCurrency,
    formatDate,
    handleCreateResponsibility,
    handlePayInstallment,
  } = useClientFinance(clientId);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!client) return <div className="p-8 text-center">Cliente não encontrado</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/cliente/${id}`)} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Financeiro - {client.nome}</h1>
      </div>

      {/* Resumo */}
      <FinanceSummary totals={totals} formatCurrency={formatCurrency} />

      {/* Botão nova obrigação */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
      >
        <Plus size={18} /> Nova Obrigação
      </button>

      {/* Formulário nova obrigação */}
      {showForm && (
        <FinanceForm
          formData={formData}
          setFormData={setFormData}
          setShowForm={setShowForm}
          handleCreateResponsibility={handleCreateResponsibility}
        />
      )}

      {/* Lista de obrigações e parcelas */}
      <FinanceList
        responsibilities={responsibilities}
        installments={installments}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        handlePayInstallment={handlePayInstallment}
      />
    </div>
  );
}