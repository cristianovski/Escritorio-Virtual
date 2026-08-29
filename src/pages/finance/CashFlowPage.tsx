import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';
import type { FinancialTransaction, FinancialTransactionInsert } from '../../types';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Surface } from '../../components/ui/Surface';

const fieldClassName =
  'h-11 w-full min-w-0 rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70';

export function CashFlowPage() {
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'entrada' | 'saida'>('saida');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('12');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, clients ( nome )')
        .order('due_date', { ascending: true });
      if (error) throw error;
      setTransactions(data || []);
    } catch {
      toast({
        title: 'Não foi possível carregar o fluxo de caixa',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    const normalizedDescription = desc.trim();
    const totalAmount = Number(amount.replace(',', '.'));

    if (!normalizedDescription || !amount || !dueDate) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um valor maior que zero.', variant: 'destructive' });
      return;
    }

    const months = Number(recurringMonths);
    if (isRecurring && (!Number.isInteger(months) || months < 2 || months > 60)) {
      toast({
        title: 'Recorrência inválida',
        description: 'Escolha uma quantidade entre 2 e 60 meses.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const inserts: FinancialTransactionInsert[] = [];
      const recurrenceId = crypto.randomUUID();

      if (isRecurring) {
        for (let i = 0; i < months; i++) {
          const date = new Date(`${dueDate}T12:00:00`);
          date.setMonth(date.getMonth() + i);
          inserts.push({
            description: `${normalizedDescription} (${i + 1}/${months})`,
            amount: totalAmount,
            type,
            status: 'pendente',
            due_date: date.toISOString().split('T')[0],
            category: type === 'saida' ? 'Custo Fixo' : 'Receita Geral',
            recurrence_id: recurrenceId,
          });
        }
      } else {
        inserts.push({
          description: normalizedDescription,
          amount: totalAmount,
          type,
          status: 'pendente',
          due_date: dueDate,
          category: type === 'saida' ? 'Despesa' : 'Receita Geral',
        });
      }

      const { error } = await supabase.from('transactions').insert(inserts);
      if (error) throw error;

      toast({ title: 'Lançamento salvo', description: 'A movimentação foi adicionada ao caixa.', variant: 'success' });
      setDesc('');
      setAmount('');
      setDueDate('');
      setIsRecurring(false);
      void fetchData();
    } catch (error: unknown) {
      const description = error instanceof Error ? error.message : 'Falha ao salvar lançamento.';
      toast({ title: 'Erro', description, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSave();
  };

  const toggleStatus = async (transactionId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    const paymentDate = nextStatus === 'pago' ? new Date().toISOString().split('T')[0] : null;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: nextStatus, payment_date: paymentDate })
        .eq('id', transactionId);
      if (error) throw error;
      void fetchData();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível atualizar o lançamento.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId || deleting) return;

    const targetId = deleteTargetId;
    setDeleting(true);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', targetId);
      if (error) throw error;
      setDeleteTargetId(null);
      await fetchData();
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível remover o lançamento.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const currentMonthNum = currentDate.getMonth();
  const currentYearNum = currentDate.getFullYear();

  const totalPotencial = transactions
    .filter((transaction) => transaction.category === 'Estimativa' && transaction.status === 'pendente')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const transacoesMes = transactions.filter((transaction) => {
    if (transaction.category === 'Estimativa') return false;
    const date = new Date(`${transaction.due_date}T12:00:00`);
    return date.getMonth() === currentMonthNum && date.getFullYear() === currentYearNum;
  });

  const entradasMes = transacoesMes
    .filter((transaction) => transaction.type === 'entrada')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const saidasMes = transacoesMes
    .filter((transaction) => transaction.type === 'saida')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const saldoMes = entradasMes - saidasMes;

  const fmtCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const metrics = [
    { label: 'Entradas do mês', value: entradasMes, icon: TrendingUp, iconClassName: 'text-success' },
    { label: 'Saídas do mês', value: saidasMes, icon: TrendingDown, iconClassName: 'text-danger' },
    {
      label: 'Saldo projetado',
      value: saldoMes,
      icon: CircleDollarSign,
      iconClassName: saldoMes >= 0 ? 'text-success' : 'text-danger',
    },
    {
      label: 'Honorários potenciais',
      value: totalPotencial,
      icon: Target,
      iconClassName: 'text-info',
      hint: 'Estimativas pendentes',
    },
  ];

  return (
    <>
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-content space-y-7 p-4 sm:p-6 lg:p-8">
          <PageHeader
            title="Fluxo de caixa"
            description="Acompanhe receitas, despesas e honorários previstos em um só lugar."
            actions={(
              <div className="flex items-center rounded-control bg-secondary" role="group" aria-label="Selecionar mês do fluxo de caixa">
                <button type="button" onClick={prevMonth} className="flex h-11 w-11 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Ver mês anterior">
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <span className="w-36 px-1 text-center text-sm font-medium capitalize text-foreground sm:w-40" aria-live="polite">{monthName}</span>
                <button type="button" onClick={nextMonth} className="flex h-11 w-11 items-center justify-center rounded-control text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Ver próximo mês">
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            )}
          />

          <Surface padding="none" className="overflow-hidden">
            <dl className="grid sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric, index) => (
                <div key={metric.label} className={`min-w-0 p-5 ${index > 0 ? 'border-t border-border/70 sm:border-t-0' : ''} ${index % 2 === 1 ? 'sm:border-l' : ''} ${index > 1 ? 'sm:border-t xl:border-t-0' : ''} ${index > 0 ? 'xl:border-l' : ''}`}>
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <metric.icon size={15} className={metric.iconClassName} aria-hidden="true" />
                    {metric.label}
                  </dt>
                  <dd className="mt-2 break-words text-xl font-semibold tracking-[-0.025em] text-tabular text-foreground sm:text-2xl">{fmtCurrency(metric.value)}</dd>
                  {metric.hint ? <dd className="mt-1 text-xs text-muted-foreground">{metric.hint}</dd> : null}
                </div>
              ))}
            </dl>
          </Surface>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
            <Surface className="h-fit xl:sticky xl:top-6" padding="lg">
              <div className="mb-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Novo lançamento</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Registre uma movimentação geral do escritório.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <span id="transaction-type-label" className="mb-2 block text-sm font-medium text-foreground">Tipo de lançamento</span>
                  <div className="grid grid-cols-2 gap-1 rounded-control bg-secondary p-1" role="group" aria-labelledby="transaction-type-label">
                    <button type="button" onClick={() => setType('entrada')} aria-pressed={type === 'entrada'} className={`h-11 rounded-[0.6rem] px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${type === 'entrada' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Entrada</button>
                    <button type="button" onClick={() => setType('saida')} aria-pressed={type === 'saida'} className={`h-11 rounded-[0.6rem] px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${type === 'saida' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Saída</button>
                  </div>
                </div>

                <div>
                  <label htmlFor="cash-description" className="mb-2 block text-sm font-medium text-foreground">Descrição</label>
                  <input id="cash-description" type="text" value={desc} onChange={(event) => setDesc(event.target.value)} placeholder="Ex.: aluguel, sistema ou internet" className={fieldClassName} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="cash-amount" className="mb-2 block text-sm font-medium text-foreground">Valor</label>
                    <input id="cash-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00" className={fieldClassName} required />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="cash-due-date" className="mb-2 block text-sm font-medium text-foreground">Vencimento</label>
                    <input id="cash-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={fieldClassName} required />
                  </div>
                </div>

                <div className="rounded-control bg-surface-subtle p-4">
                  <label htmlFor="cash-recurring" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-foreground">
                    <input id="cash-recurring" type="checkbox" checked={isRecurring} onChange={(event) => setIsRecurring(event.target.checked)} className="h-4 w-4 rounded border-input accent-brand" />
                    <RefreshCw size={16} className="text-muted-foreground" aria-hidden="true" />
                    Repetir lançamento
                  </label>
                  {isRecurring ? (
                    <div className="mt-3 border-t border-border/70 pt-4">
                      <label htmlFor="cash-recurring-months" className="mb-2 block text-sm font-medium text-foreground">Quantidade de meses</label>
                      <input id="cash-recurring-months" type="number" min="2" max="60" value={recurringMonths} onChange={(event) => setRecurringMonths(event.target.value)} className={fieldClassName} required />
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">As cópias serão criadas automaticamente nos meses seguintes.</p>
                    </div>
                  ) : null}
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  <Plus size={17} aria-hidden="true" />
                  {saving ? 'Salvando…' : 'Salvar lançamento'}
                </Button>
              </form>
            </Surface>

            <Surface padding="none" className="min-h-[28rem] min-w-0 overflow-hidden">
              <div className="border-b border-border/70 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Movimentações de <span className="capitalize">{monthName.split(' ')[0]}</span></h2>
                <p className="mt-1 text-sm text-muted-foreground">Entradas e saídas previstas para o período.</p>
              </div>

              {loading ? (
                <div className="flex min-h-64 items-center justify-center" role="status" aria-live="polite">
                  <Clock3 className="animate-spin text-muted-foreground motion-reduce:animate-none" size={24} aria-hidden="true" />
                  <span className="sr-only">Carregando movimentações</span>
                </div>
              ) : transacoesMes.length === 0 ? (
                <EmptyState icon={<Calendar aria-hidden="true" />} title="Nenhuma movimentação neste mês" description="Use o formulário para registrar a primeira entrada ou saída do período." />
              ) : (
                <div className="divide-y divide-border/70">
                  {transacoesMes.map((transaction) => {
                    const isEntry = transaction.type === 'entrada';
                    const isPaid = transaction.status === 'pago';

                    return (
                      <article key={transaction.id} className={`flex min-w-0 flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isPaid ? 'bg-surface-subtle/60' : 'hover:bg-surface-subtle/50'}`}>
                        <div className="flex min-w-0 items-start gap-3">
                          <button type="button" onClick={() => void toggleStatus(transaction.id, transaction.status)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isPaid ? 'border-success/20 bg-success-subtle text-success' : 'border-border bg-card text-muted-foreground hover:border-brand/30 hover:text-brand'}`} aria-label={isPaid ? `Marcar ${transaction.description} como pendente` : `Marcar ${transaction.description} como pago`} aria-pressed={isPaid}>
                            <CheckCircle2 size={19} aria-hidden="true" />
                          </button>
                          <div className="min-w-0 pt-0.5">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className={`min-w-0 break-words text-sm font-medium ${isPaid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{transaction.description}</h3>
                              {transaction.recurrence_id ? (
                                <span className="inline-flex text-muted-foreground" title="Lançamento recorrente">
                                  <RefreshCw size={13} aria-hidden="true" />
                                  <span className="sr-only">Lançamento recorrente</span>
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <StatusBadge tone={isEntry ? 'success' : 'danger'} size="sm">{isEntry ? 'Entrada' : 'Saída'}</StatusBadge>
                              {transaction.clients ? (
                                <span className="inline-flex min-w-0 items-center gap-1.5"><Briefcase size={13} className="shrink-0" aria-hidden="true" /><span className="max-w-48 truncate">{transaction.clients.nome}</span></span>
                              ) : null}
                              <span className="inline-flex items-center gap-1.5 text-tabular"><Calendar size={13} aria-hidden="true" />{new Date(`${transaction.due_date}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-2 pl-14 sm:justify-end sm:pl-0">
                          <span className={`min-w-0 break-words text-right text-sm font-semibold text-tabular ${isEntry ? 'text-success-foreground' : 'text-danger-foreground'} ${isPaid ? 'opacity-60' : ''}`}>{isEntry ? '+' : '−'} {fmtCurrency(Number(transaction.amount))}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTargetId(transaction.id)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={`Excluir lançamento ${transaction.description}`}>
                            <Trash2 size={17} aria-hidden="true" />
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </Surface>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTargetId(null)}
        title="Excluir lançamento?"
        message="Esta movimentação será removida do fluxo de caixa. Essa ação não pode ser desfeita."
        onConfirm={() => void handleDelete()}
        onCancel={() => !deleting && setDeleteTargetId(null)}
        confirming={deleting}
      />
    </>
  );
}
