import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';
import type { Client, FinancialTransaction, FinancialTransactionInsert } from '../../types';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Surface } from '../../components/ui/Surface';

const fieldClassName =
  'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/70';

export function ClientFinancePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [cliente, setCliente] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [tipoLancamento, setTipoLancamento] = useState<'a_vista' | 'parcelado' | 'estimativa'>('a_vista');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('2');
  const [startDate, setStartDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [clientRes, transRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('transactions').select('*').eq('client_id', id).order('due_date', { ascending: true }),
      ]);
      if (clientRes.error) throw clientRes.error;
      if (transRes.error) throw transRes.error;
      setCliente(clientRes.data as Client);
      setTransactions(transRes.data || []);
    } catch (error: unknown) {
      console.error('Falha ao carregar honorários:', error);
      setLoadError(true);
      toast({
        title: 'Honorários indisponíveis',
        description: 'Não foi possível confirmar os valores deste cliente. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    const normalizedDescription = desc.trim();
    const totalAmount = Number(amount.replace(',', '.'));

    if (!normalizedDescription || !amount || (tipoLancamento !== 'estimativa' && !startDate)) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      toast({ title: 'Valor inválido', description: 'Informe um valor maior que zero.', variant: 'destructive' });
      return;
    }

    const parcelas = Number(installments);
    if (tipoLancamento === 'parcelado' && (!Number.isInteger(parcelas) || parcelas < 2 || parcelas > 120)) {
      toast({
        title: 'Parcelamento inválido',
        description: 'Escolha uma quantidade entre 2 e 120 parcelas.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const inserts: FinancialTransactionInsert[] = [];
      const recurrenceId = crypto.randomUUID();

      if (tipoLancamento === 'a_vista') {
        inserts.push({
          client_id: id,
          description: normalizedDescription,
          amount: totalAmount,
          type: 'entrada',
          status: 'pendente',
          due_date: startDate,
          category: 'Honorários',
        });
      } else if (tipoLancamento === 'estimativa') {
        inserts.push({
          client_id: id,
          description: `[Estimativa] ${normalizedDescription}`,
          amount: totalAmount,
          type: 'entrada',
          status: 'pendente',
          due_date: new Date().toISOString().split('T')[0],
          category: 'Estimativa',
        });
      } else {
        const valorParcela = totalAmount / parcelas;

        for (let i = 0; i < parcelas; i++) {
          const date = new Date(`${startDate}T12:00:00`);
          date.setMonth(date.getMonth() + i);
          inserts.push({
            client_id: id,
            description: `${normalizedDescription} (${i + 1}/${parcelas})`,
            amount: valorParcela,
            type: 'entrada',
            status: 'pendente',
            due_date: date.toISOString().split('T')[0],
            category: 'Honorários',
            recurrence_id: recurrenceId,
          });
        }
      }

      const { error } = await supabase.from('transactions').insert(inserts);
      if (error) throw error;

      toast({ title: 'Lançamento salvo', description: 'A obrigação financeira foi criada.', variant: 'success' });
      setDesc('');
      setAmount('');
      setStartDate('');
      setTipoLancamento('a_vista');
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

  const fmtCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const fmtDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');

  const entradasReais = transactions.filter((transaction) => transaction.category !== 'Estimativa');
  const estimativas = transactions.filter((transaction) => transaction.category === 'Estimativa');
  const totalRecebido = entradasReais
    .filter((transaction) => transaction.status === 'pago')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalPendente = entradasReais
    .filter((transaction) => transaction.status === 'pendente')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const totalEstimado = estimativas
    .filter((transaction) => transaction.status === 'pendente')
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const metrics = [
    { label: 'Já recebido', value: totalRecebido, icon: CheckCircle2, iconClassName: 'text-success' },
    { label: 'A receber', value: totalPendente, icon: Clock3, iconClassName: 'text-warning' },
    { label: 'Potencial estimado', value: totalEstimado, icon: Target, iconClassName: 'text-info' },
  ];

  return (
    <>
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto w-full max-w-content space-y-7 p-4 sm:p-6 lg:p-8">
          <PageHeader
            headingLevel={2}
            title="Honorários e recebimentos"
            description={cliente?.nome ? `Acompanhe acordos e valores vinculados a ${cliente.nome}.` : 'Acompanhe acordos, recebimentos e estimativas deste atendimento.'}
          />

          {loading ? (
            <Surface role="status" aria-live="polite" className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
              <Clock3 className="animate-spin motion-reduce:animate-none" size={20} aria-hidden="true" />
              Carregando valores confirmados…
            </Surface>
          ) : loadError ? (
            <EmptyState
              icon={<AlertCircle aria-hidden="true" />}
              title="Valores indisponíveis"
              description="Os totais não serão exibidos enquanto não for possível confirmar os dados financeiros."
              action={<Button variant="outline" onClick={() => void fetchData()}>Tentar novamente</Button>}
            />
          ) : (
            <>
          <Surface padding="none" className="overflow-hidden">
            <dl className="grid sm:grid-cols-3">
              {metrics.map((metric, index) => (
                <div key={metric.label} className={`min-w-0 p-5 ${index > 0 ? 'border-t border-border/70 sm:border-l sm:border-t-0' : ''}`}>
                  <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <metric.icon size={15} className={metric.iconClassName} aria-hidden="true" />
                    {metric.label}
                  </dt>
                  <dd className="mt-2 break-words text-xl font-semibold tracking-[-0.025em] text-tabular text-foreground sm:text-2xl">{fmtCurrency(metric.value)}</dd>
                </div>
              ))}
            </dl>
          </Surface>

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
            <Surface className="h-fit xl:sticky xl:top-6" padding="lg">
              <div className="mb-5">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Novo acordo</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Registre honorários contratados ou uma estimativa de êxito.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <span id="agreement-type-label" className="mb-2 block text-sm font-medium text-foreground">Tipo de acordo</span>
                  <div className="grid grid-cols-1 gap-1 rounded-control bg-secondary p-1 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3" role="group" aria-labelledby="agreement-type-label">
                    {([
                      ['a_vista', 'À vista'],
                      ['parcelado', 'Parcelado'],
                      ['estimativa', 'Estimativa'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTipoLancamento(value)}
                        aria-pressed={tipoLancamento === value}
                        className={`h-11 rounded-[0.6rem] px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tipoLancamento === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="client-finance-description" className="mb-2 block text-sm font-medium text-foreground">Descrição</label>
                  <input
                    id="client-finance-description"
                    type="text"
                    value={desc}
                    onChange={(event) => setDesc(event.target.value)}
                    placeholder={tipoLancamento === 'estimativa' ? 'Ex.: RPV ou precatório' : 'Ex.: honorários iniciais'}
                    className={fieldClassName}
                    required
                  />
                </div>

                <div className={`grid gap-4 ${tipoLancamento !== 'estimativa' ? 'sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2' : ''}`}>
                  <div className="min-w-0">
                    <label htmlFor="client-finance-amount" className="mb-2 block text-sm font-medium text-foreground">Valor total</label>
                    <input id="client-finance-amount" type="number" inputMode="decimal" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="R$ 0,00" className={fieldClassName} required />
                  </div>
                  {tipoLancamento !== 'estimativa' ? (
                    <div className="min-w-0">
                      <label htmlFor="client-finance-date" className="mb-2 block text-sm font-medium text-foreground">Primeiro vencimento</label>
                      <input id="client-finance-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={fieldClassName} required />
                    </div>
                  ) : null}
                </div>

                {tipoLancamento === 'parcelado' ? (
                  <div>
                    <label htmlFor="client-finance-installments" className="mb-2 block text-sm font-medium text-foreground">Quantidade de parcelas</label>
                    <input id="client-finance-installments" type="number" min="2" max="120" value={installments} onChange={(event) => setInstallments(event.target.value)} className={fieldClassName} required />
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">O valor será dividido igualmente em {installments} meses.</p>
                  </div>
                ) : null}

                {tipoLancamento === 'estimativa' ? (
                  <div className="flex gap-3 rounded-control bg-info-subtle p-4 text-info-foreground">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <p className="text-xs leading-5">Estimativas não afetam o saldo e permanecem separadas dos honorários contratados.</p>
                  </div>
                ) : null}

                <Button type="submit" disabled={saving} className="w-full">
                  <Plus size={17} aria-hidden="true" />
                  {saving ? 'Salvando…' : 'Salvar lançamento'}
                </Button>
              </form>
            </Surface>

            <Surface padding="none" className="min-w-0 overflow-hidden">
              <div className="border-b border-border/70 px-5 py-5 sm:px-6">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">Lançamentos financeiros</h2>
                <p className="mt-1 text-sm text-muted-foreground">Honorários ativos, recebidos e valores sujeitos a êxito.</p>
              </div>

              <section aria-labelledby="active-fees-title">
                <div className="px-5 pb-2 pt-5 sm:px-6">
                  <h3 id="active-fees-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <TrendingUp size={16} className="text-success" aria-hidden="true" />
                    Honorários ativos
                  </h3>
                </div>

                {entradasReais.length === 0 ? (
                  <EmptyState compact icon={<CircleDollarSign aria-hidden="true" />} title="Nenhum honorário lançado" description="Os acordos contratados aparecerão aqui." />
                ) : (
                  <div className="divide-y divide-border/70">
                    {entradasReais.map((transaction) => {
                      const isPaid = transaction.status === 'pago';
                      return (
                        <article key={transaction.id} className={`flex min-w-0 flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6 ${isPaid ? 'bg-surface-subtle/60' : 'hover:bg-surface-subtle/50'}`}>
                          <div className="flex min-w-0 items-start gap-3">
                            <button type="button" onClick={() => void toggleStatus(transaction.id, transaction.status)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isPaid ? 'border-success/20 bg-success-subtle text-success' : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-primary'}`} aria-label={isPaid ? `Marcar ${transaction.description} como pendente` : `Marcar ${transaction.description} como recebido`} aria-pressed={isPaid}>
                              <CheckCircle2 size={19} aria-hidden="true" />
                            </button>
                            <div className="min-w-0 pt-0.5">
                              <h4 className={`break-words text-sm font-medium ${isPaid ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{transaction.description}</h4>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5 text-tabular"><Calendar size={13} aria-hidden="true" />Vence em {fmtDate(transaction.due_date)}</span>
                                <StatusBadge tone={isPaid ? 'success' : 'warning'} size="sm">{isPaid ? 'Recebido' : 'Pendente'}</StatusBadge>
                              </div>
                            </div>
                          </div>
                          <div className="flex min-w-0 items-center justify-between gap-2 pl-14 sm:justify-end sm:pl-0">
                            <span className={`min-w-0 break-words text-right text-sm font-semibold text-tabular ${isPaid ? 'text-success-foreground opacity-70' : 'text-foreground'}`}>{fmtCurrency(Number(transaction.amount))}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTargetId(transaction.id)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={`Excluir lançamento ${transaction.description}`}>
                              <Trash2 size={17} aria-hidden="true" />
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {estimativas.length > 0 ? (
                <section aria-labelledby="estimated-fees-title" className="border-t border-border/70">
                  <div className="bg-surface-subtle/50 px-5 py-4 sm:px-6">
                    <h3 id="estimated-fees-title" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Target size={16} className="text-info" aria-hidden="true" />
                      Estimativas de êxito
                    </h3>
                  </div>
                  <div className="divide-y divide-border/70">
                    {estimativas.map((transaction) => (
                      <article key={transaction.id} className="flex min-w-0 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="min-w-0">
                          <h4 className="break-words text-sm font-medium text-foreground">{transaction.description}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">Valor sujeito ao êxito da ação</p>
                        </div>
                        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-end">
                          <span className="min-w-0 break-words text-right text-sm font-semibold text-tabular text-info-foreground">{fmtCurrency(Number(transaction.amount))}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTargetId(transaction.id)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label={`Excluir estimativa ${transaction.description}`}>
                            <Trash2 size={17} aria-hidden="true" />
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </Surface>
          </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && !deleting && setDeleteTargetId(null)}
        title="Excluir lançamento?"
        message="Este lançamento financeiro será removido. Essa ação não pode ser desfeita."
        onConfirm={() => void handleDelete()}
        onCancel={() => !deleting && setDeleteTargetId(null)}
        confirming={deleting}
      />
    </>
  );
}
