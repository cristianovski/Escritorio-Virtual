import { ArrowLeft, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCashFlow } from '../../hooks/useCashFlow';
import { getLocalDateISO } from '../../lib/utils';
import { CashFlowSummary } from './components/CashFlowSummary';
import { ExpenseForm } from './components/ExpenseForm';
import { PayablesTable } from './components/PayablesTable';
import { ReceivablesTable } from './components/ReceivablesTable';

export function CashFlowPage() {
  const navigate = useNavigate();
  const {
    loading,
    installments,
    expenses,
    filterMonth,
    setFilterMonth,
    showExpenseForm,
    setShowExpenseForm,
    expenseForm,
    setExpenseForm,
    totalReceber,
    totalPagar,
    saldoProjetado,
    handleCreateExpense,
    handlePayExpense,
  } = useCashFlow(getLocalDateISO().slice(0, 7));

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Fluxo de Caixa</h1>
      </div>

      {/* Filtro de mês */}
      <div className="mb-6 flex items-center gap-2">
        <Calendar size={18} className="text-slate-400" />
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border border-slate-300 rounded-lg p-2"
        />
      </div>

      {/* Cards de resumo */}
      <CashFlowSummary
        totalReceber={totalReceber}
        totalPagar={totalPagar}
        saldoProjetado={saldoProjetado}
        formatCurrency={formatCurrency}
      />

      {/* Botão nova despesa */}
      <button
        onClick={() => setShowExpenseForm(!showExpenseForm)}
        className="mb-6 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
      >
        <Plus size={18} /> Nova Despesa
      </button>

      {showExpenseForm && (
        <ExpenseForm
          expenseForm={expenseForm}
          setExpenseForm={setExpenseForm}
          setShowExpenseForm={setShowExpenseForm}
          handleCreateExpense={handleCreateExpense}
        />
      )}

      {/* Tabela de Contas a Receber */}
      <ReceivablesTable
        installments={installments}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Tabela de Contas a Pagar */}
      <PayablesTable
        expenses={expenses}
        handlePayExpense={handlePayExpense}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
}