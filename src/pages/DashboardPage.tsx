import { type MouseEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Cake,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Edit2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { useConfirm } from '../hooks/useConfirm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/button';
import type { BenefitStatus, Client, ProcessPhase } from '../types';

type StatusFilter = 'Todos' | BenefitStatus;

interface Note {
  id: string;
  texto: string;
}

const getClientPhase = (client: Client) => client.fase_processo ?? 'Administrativo';

const getStatusStyle = (status?: BenefitStatus) => {
  switch (status) {
    case 'Finalizado':
      return { dot: 'bg-success', badge: 'bg-success-subtle text-success-foreground' };
    case 'Em Andamento':
      return { dot: 'bg-brand', badge: 'bg-brand-subtle text-brand' };
    case 'Suspenso':
      return { dot: 'bg-warning', badge: 'bg-warning-subtle text-warning-foreground' };
    default:
      return { dot: 'bg-muted-foreground/65', badge: 'bg-secondary text-muted-foreground' };
  }
};

const getPhaseStyle = () => 'bg-secondary text-muted-foreground';

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    confirm: requestConfirmation,
    isOpen: isConfirmOpen,
    message: confirmMessage,
    handleConfirm,
    handleCancel,
  } = useConfirm();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients((data || []) as Client[]);
    } catch (error: unknown) {
      console.error('Falha ao carregar clientes:', error);
      toast({
        title: 'Não foi possível carregar os clientes',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_notes')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data) setNotes(data as Note[]);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  }, []);

  useEffect(() => {
    void fetchClients();
    void fetchNotes();
  }, [fetchClients, fetchNotes]);

  const addNote = async () => {
    const texto = newNote.trim();
    if (!texto) return;
    setNewNote('');

    try {
      const { data, error } = await supabase
        .from('dashboard_notes')
        .insert([{ texto }])
        .select();
      if (error) throw error;
      if (data) setNotes((current) => [...current, data[0] as Note]);
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
      toast({ title: 'Lembrete não salvo', description: 'Tente novamente.', variant: 'destructive' });
    }
  };

  const updateNote = async (id: string) => {
    const texto = editNoteText.trim();
    if (!texto) return;

    setNotes((current) => current.map((note) => (
      note.id === id ? { ...note, texto } : note
    )));
    setEditingNoteId(null);

    try {
      const { error } = await supabase.from('dashboard_notes').update({ texto }).eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      toast({
        title: 'Lembrete não atualizado',
        description: 'A versão anterior foi restaurada.',
        variant: 'destructive',
      });
      void fetchNotes();
    }
  };

  const removeNote = async (id: string) => {
    setNotes((current) => current.filter((note) => note.id !== id));
    setExpandedNotes((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    try {
      const { error } = await supabase.from('dashboard_notes').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao apagar lembrete:', error);
      void fetchNotes();
    }
  };

  const handleDeleteClient = async (id: number, event: MouseEvent) => {
    event.stopPropagation();
    const confirmed = await requestConfirmation(
      'Esta ação removerá a ficha, os documentos e o histórico do cliente. Não será possível desfazer.',
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Cliente removido', description: 'O registro foi excluído.', variant: 'success' });
      void fetchClients();
    } catch (error: unknown) {
      console.error('Falha ao excluir cliente:', error);
      toast({
        title: 'Não foi possível excluir o cliente',
        description: 'Tente novamente ou verifique suas permissões.',
        variant: 'destructive',
      });
    }
  };

  const toggleStatus = async (client: Client, event: MouseEvent) => {
    event.stopPropagation();
    const cycle: BenefitStatus[] = ['A Iniciar', 'Em Andamento', 'Finalizado'];
    const currentStatus = client.status_processo ?? 'A Iniciar';
    const nextStatus = cycle[(cycle.indexOf(currentStatus) + 1) % cycle.length];

    setClients((current) => current.map((item) => (
      item.id === client.id ? { ...item, status_processo: nextStatus } : item
    )) as Client[]);

    try {
      const { error } = await supabase
        .from('clients')
        .update({ status_processo: nextStatus })
        .eq('id', client.id);
      if (error) throw error;
      toast({ title: 'Status atualizado', description: 'Novo status: ' + nextStatus + '.' });
    } catch {
      toast({ title: 'Status não atualizado', description: 'Tente novamente.', variant: 'destructive' });
      void fetchClients();
    }
  };

  const togglePhase = async (client: Client, event: MouseEvent) => {
    event.stopPropagation();
    const cycle: ProcessPhase[] = ['Administrativo', 'Judicial', 'Execução'];
    const currentPhase = getClientPhase(client);
    const nextPhase = cycle[(cycle.indexOf(currentPhase) + 1) % cycle.length];

    setClients((current) => current.map((item) => (
      item.id === client.id ? { ...item, fase_processo: nextPhase } : item
    )) as Client[]);

    try {
      const { error } = await supabase
        .from('clients')
        .update({ fase_processo: nextPhase })
        .eq('id', client.id);
      if (error) throw error;
      toast({ title: 'Fase atualizada', description: 'Nova fase: ' + nextPhase + '.' });
    } catch {
      toast({ title: 'Fase não atualizada', description: 'Tente novamente.', variant: 'destructive' });
      void fetchClients();
    }
  };

  const stats = {
    total: clients.length,
    iniciar: clients.filter((client) => !client.status_processo || client.status_processo === 'A Iniciar').length,
    andamento: clients.filter((client) => client.status_processo === 'Em Andamento').length,
    finalizado: clients.filter((client) => client.status_processo === 'Finalizado').length,
    suspenso: clients.filter((client) => client.status_processo === 'Suspenso').length,
  };

  const metrics: Array<{ label: string; value: number; filter: StatusFilter }> = [
    { label: 'Todos', value: stats.total, filter: 'Todos' },
    { label: 'A iniciar', value: stats.iniciar, filter: 'A Iniciar' },
    { label: 'Em andamento', value: stats.andamento, filter: 'Em Andamento' },
    { label: 'Finalizados', value: stats.finalizado, filter: 'Finalizado' },
    { label: 'Suspensos', value: stats.suspenso, filter: 'Suspenso' },
  ];

  const filteredClients = clients.filter((client) => (
    statusFilter === 'Todos' || (client.status_processo || 'A Iniciar') === statusFilter
  ));
  const visibleClients = filteredClients.slice(0, 8);
  const clientsWithoutPhone = clients.filter((client) => !client.telefone?.trim()).length;
  const nextActionClient = clients.find(
    (client) => !client.status_processo || client.status_processo === 'A Iniciar',
  ) ?? clients.find((client) => client.status_processo === 'Em Andamento');
  const nextActionIsNew = !nextActionClient?.status_processo || nextActionClient.status_processo === 'A Iniciar';

  const currentMonth = new Date().getMonth();
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const birthdays = clients
    .filter((client) => {
      if (!client.data_nascimento) return false;
      const parts = client.data_nascimento.split('-');
      return parts.length === 3 && Number(parts[1]) - 1 === currentMonth;
    })
    .sort((a, b) => Number(a.data_nascimento?.split('-')[2]) - Number(b.data_nascimento?.split('-')[2]));

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-background text-foreground">
        <div className="mx-auto w-full max-w-content space-y-7 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          <PageHeader
            eyebrow="PrevRural"
            title="Visão geral"
            description="Acompanhe o movimento do escritório e retome os atendimentos mais recentes."
            actions={(
              <Button size="lg" onClick={() => navigate('/cliente/novo')}>
                <UserPlus size={17} aria-hidden="true" /> Novo cliente
              </Button>
            )}
          />

          {!loading && nextActionClient ? (
            <section
              aria-labelledby="next-action-title"
              className="flex flex-col gap-4 border-y border-border/80 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="min-w-0 border-l-2 border-brand pl-3.5">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brand">Próxima ação</p>
                <h2 id="next-action-title" className="mt-1 truncate text-base font-semibold tracking-[-0.015em] text-foreground">
                  {nextActionIsNew ? 'Iniciar atendimento de ' : 'Retomar atendimento de '}
                  {nextActionClient.nome || 'cliente sem nome'}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {nextActionIsNew ? 'O cadastro mais recente ainda aguarda andamento.' : 'Este atendimento já está em andamento.'}
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => navigate('/cliente/' + nextActionClient.id)}
              >
                Abrir ficha <ChevronRight size={16} aria-hidden="true" />
              </Button>
            </section>
          ) : null}

          <section aria-labelledby="portfolio-summary-title">
            <h2 id="portfolio-summary-title" className="sr-only">Resumo da carteira</h2>
            <div className="flex overflow-x-auto border-y border-border/80 bg-card">
              {metrics.map((metric) => {
                const active = statusFilter === metric.filter;
                return (
                  <button
                    type="button"
                    key={metric.filter}
                    aria-pressed={active}
                    onClick={() => setStatusFilter(metric.filter)}
                    className={cn(
                      'relative -mb-px min-w-32 flex-1 border-b-2 border-r border-border/70 px-4 py-3.5 text-left transition-colors last:border-r-0 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none',
                      active ? 'border-b-brand bg-brand-subtle/45' : 'border-b-transparent hover:bg-secondary/55',
                    )}
                  >
                    <span className="block text-2xl font-semibold leading-none tracking-[-0.03em] tabular-nums text-foreground">{metric.value}</span>
                    <span className="mt-1.5 block whitespace-nowrap text-xs text-muted-foreground">{metric.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <section aria-labelledby="clients-title" className="min-w-0 overflow-hidden border-y border-border/80 bg-card">
              <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                <div>
                  <h2 id="clients-title" className="text-base font-semibold tracking-[-0.015em] text-foreground">Atendimentos recentes</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {loading ? 'Carregando…' : filteredClients.length + ' ' + (filteredClients.length === 1 ? 'cliente' : 'clientes') + ' nesta seleção'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(
                    statusFilter === 'Todos'
                      ? '/clientes'
                      : '/clientes?status=' + encodeURIComponent(statusFilter),
                  )}
                >
                  Ver todos <ChevronRight size={16} aria-hidden="true" />
                </Button>
              </div>

              {loading ? (
                <div className="space-y-px border-t border-border/70 bg-border/70" aria-live="polite" aria-busy="true">
                  <span className="sr-only">Carregando atendimentos</span>
                  {[1, 2, 3, 4].map((item) => <div key={item} className="h-[4.25rem] animate-pulse bg-card motion-reduce:animate-none" />)}
                </div>
              ) : visibleClients.length === 0 ? (
                <EmptyState
                  className="border-t border-border/70"
                  icon={<Users aria-hidden="true" />}
                  title="Nenhum cliente nesta situação"
                  description="Escolha outro indicador para consultar os atendimentos."
                  action={<Button variant="outline" onClick={() => setStatusFilter('Todos')}>Mostrar todos</Button>}
                />
              ) : (
                <div className="divide-y divide-border/70 border-t border-border/70">
                  {visibleClients.map((client) => {
                    const statusStyle = getStatusStyle(client.status_processo);
                    const clientName = client.nome || 'Cliente sem nome';

                    return (
                      <article
                        key={client.id}
                        className="grid gap-3 px-4 py-3 transition-colors hover:bg-secondary/35 sm:px-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(10rem,0.8fr)_auto] lg:items-center motion-reduce:transition-none"
                      >
                        <button
                          type="button"
                          onClick={() => navigate('/cliente/' + client.id)}
                          className="group flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          aria-label={'Abrir resumo de ' + clientName}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground" aria-hidden="true">
                            {clientName.charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground group-hover:text-brand">{clientName}</span>
                            <span className="mt-0.5 block truncate text-xs tabular-nums text-muted-foreground">{client.cpf || 'CPF não informado'}</span>
                          </span>
                        </button>

                        <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-1">
                          <p className="flex min-w-0 items-center gap-1.5"><Phone size={13} className="shrink-0" aria-hidden="true" /><span className="truncate">{client.telefone || 'Sem telefone'}</span></p>
                          <p className="flex min-w-0 items-center gap-1.5"><MapPin size={13} className="shrink-0" aria-hidden="true" /><span className="truncate">{client.cidade || client.endereco || 'Local não informado'}</span></p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={(event) => void togglePhase(client, event)}
                            className={cn(
                              'min-h-10 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                              getPhaseStyle(),
                            )}
                            aria-label={'Alterar fase de ' + clientName + '. Fase atual: ' + getClientPhase(client)}
                            title="Alterar fase"
                          >
                            {getClientPhase(client)}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => void toggleStatus(client, event)}
                            className={cn(
                              'inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                              statusStyle.badge,
                            )}
                            aria-label={'Alterar status de ' + clientName + '. Status atual: ' + (client.status_processo || 'A Iniciar')}
                            title="Alterar status"
                          >
                            <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dot)} aria-hidden="true" />
                            {client.status_processo || 'A Iniciar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/cliente/' + client.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                            aria-label={'Abrir ' + clientName}
                          >
                            <ChevronRight size={17} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => void handleDeleteClient(client.id, event)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger motion-reduce:transition-none"
                            aria-label={'Excluir ' + clientName}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <aside aria-label="Informações do dia" className="divide-y divide-border/80 border-y border-border/80 bg-card">
              <section aria-labelledby="notes-title" className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 id="notes-title" className="text-base font-semibold tracking-[-0.015em] text-foreground">Lembretes</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{notes.length} {notes.length === 1 ? 'item' : 'itens'}</p>
                  </div>
                  <Edit2 size={17} className="text-muted-foreground" aria-hidden="true" />
                </div>

                <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void addNote(); }}>
                  <label htmlFor="new-note" className="sr-only">Novo lembrete</label>
                  <input
                    id="new-note"
                    type="text"
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    placeholder="Adicionar lembrete"
                    className="h-11 min-w-0 flex-1 rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    aria-label="Adicionar lembrete"
                  >
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </form>

                <div className="mt-3 max-h-80 divide-y divide-border/70 overflow-y-auto">
                  {notes.length === 0 ? (
                    <p className="py-5 text-center text-sm text-muted-foreground">Nenhum lembrete.</p>
                  ) : notes.map((note) => {
                    const expanded = expandedNotes[note.id] || false;
                    const longText = note.texto.length > 150;
                    const editing = editingNoteId === note.id;

                    return (
                      <div key={note.id} className="py-3 first:pt-0 last:pb-0">
                        {editing ? (
                          <div className="space-y-2">
                            <label htmlFor={'note-' + note.id} className="sr-only">Editar lembrete</label>
                            <textarea
                              id={'note-' + note.id}
                              value={editNoteText}
                              onChange={(event) => setEditNoteText(event.target.value)}
                              className="w-full resize-none rounded-control border border-input bg-surface-subtle/55 p-2.5 text-sm outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingNoteId(null)}>Cancelar</Button>
                              <Button size="sm" onClick={() => void updateNote(note.id)}>Salvar</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-1">
                              <p className={cn('min-w-0 flex-1 break-words text-sm leading-5 text-foreground', expanded ? '' : 'line-clamp-3')}>{note.texto}</p>
                              <button
                                type="button"
                                onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.texto); }}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                                aria-label="Editar lembrete"
                              >
                                <Edit2 size={14} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void removeNote(note.id)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger motion-reduce:transition-none"
                                aria-label="Excluir lembrete"
                              >
                                <Trash2 size={14} aria-hidden="true" />
                              </button>
                            </div>
                            {longText ? (
                              <button
                                type="button"
                                onClick={() => setExpandedNotes((current) => ({ ...current, [note.id]: !expanded }))}
                                className="mt-1 inline-flex min-h-10 items-center gap-1 text-xs font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-expanded={expanded}
                              >
                                {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                                {expanded ? 'Ver menos' : 'Ver mais'}
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section aria-labelledby="today-title" className="overflow-hidden">
                <div className="p-5">
                  <h2 id="today-title" className="text-base font-semibold tracking-[-0.015em] text-foreground">Pontos de atenção</h2>
                  <div className="mt-3 flex items-center justify-between gap-3 bg-secondary/55 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-foreground"><AlertCircle size={16} className="text-warning" aria-hidden="true" /> Cadastros sem telefone</span>
                    <strong className="font-semibold tabular-nums text-foreground">{clientsWithoutPhone}</strong>
                  </div>
                </div>

                <div className="border-t border-border/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-foreground"><Cake size={16} className="text-muted-foreground" aria-hidden="true" /> Aniversariantes</h3>
                    <span className="text-xs capitalize text-muted-foreground">{monthName}</span>
                  </div>
                  {birthdays.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">Nenhum aniversário neste mês.</p>
                  ) : (
                    <div className="mt-3 max-h-64 divide-y divide-border/70 overflow-y-auto">
                      {birthdays.map((client) => {
                        const phone = client.telefone?.replace(/\D/g, '') || '';
                        return (
                          <div key={client.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold tabular-nums text-foreground">
                              {client.data_nascimento?.split('-')[2]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{client.nome}</p>
                              <button
                                type="button"
                                disabled={!phone}
                                onClick={() => window.open('https://wa.me/55' + phone, '_blank', 'noopener,noreferrer')}
                                className="mt-0.5 inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:text-muted-foreground"
                                aria-label={phone ? 'Enviar mensagem para ' + client.nome : client.nome + ' não possui telefone cadastrado'}
                              >
                                <MessageCircle size={14} aria-hidden="true" /> {phone ? 'Enviar mensagem' : 'Sem telefone'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(open) => !open && handleCancel()}
        title="Excluir cliente?"
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
