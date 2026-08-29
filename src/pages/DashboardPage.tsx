import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserPlus, Search, AlertCircle, Clock,
  CheckCircle, MessageCircle,
  FolderOpen, Trash2, UserCog, Calculator, 
  DollarSign, History, MapPin, Phone, Cake, Plus,
  ChevronDown, ChevronUp, Edit2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { useConfirm } from "../hooks/useConfirm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Client, BenefitStatus, ProcessPhase } from "../types";

interface Note {
  id: string;
  texto: string;
}

const getClientPhase = (client: Client) =>
  client.fase_processo ?? "Administrativo";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  
  // Novos estados para a edição de lembretes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setClients(data as Client[]);
    } catch (err: unknown) {
        console.error("Falha ao carregar clientes:", err);
        toast({ title: "Não foi possível carregar os clientes", description: "Tente novamente em instantes.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  const fetchNotes = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('dashboard_notes').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        setNotes(data as Note[]);
      }
    } catch (err) {
      console.error("Erro ao carregar lembretes:", err);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchNotes();
  }, [fetchClients, fetchNotes]);

  const addNote = async () => {
      if (!newNote.trim()) return;
      const texto = newNote;
      setNewNote(""); 

      try {
        const { data, error } = await supabase.from('dashboard_notes').insert([{ texto }]).select();
        if (!error && data) {
          setNotes(prev => [...prev, data[0] as Note]);
        }
      } catch (err) {
        console.error("Erro ao salvar lembrete:", err);
        toast({ title: "Erro", description: "Não foi possível salvar o lembrete.", variant: "destructive" });
      }
  };

  const updateNote = async (id: string) => {
    if (!editNoteText.trim()) return;

    setNotes(prev => prev.map(n => n.id === id ? { ...n, texto: editNoteText } : n));
    setEditingNoteId(null);

    try {
      const { error } = await supabase.from('dashboard_notes').update({ texto: editNoteText }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Erro ao atualizar lembrete:", err);
      toast({ title: "Erro", description: "Falha ao atualizar na nuvem.", variant: "destructive" });
      fetchNotes(); 
    }
  };

  const removeNote = async (id: string) => {
      setNotes(prev => prev.filter(n => n.id !== id));
      setExpandedNotes(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });

      try {
        await supabase.from('dashboard_notes').delete().eq('id', id);
      } catch (err) {
        console.error("Erro ao apagar lembrete:", err);
      }
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteClient = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await requestConfirmation(
      "Esta ação removerá a ficha, os documentos e o histórico do cliente. Não será possível desfazer.",
    );
    if (!confirmed) return;

    try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Cliente removido.", variant: "success" });
        fetchClients();
    } catch (err: unknown) {
        console.error("Falha ao excluir cliente:", err);
        toast({ title: "Não foi possível excluir o cliente", description: "Tente novamente ou verifique suas permissões.", variant: "destructive" });
    }
  };

  const toggleStatus = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    const ciclo: BenefitStatus[] = ["A Iniciar", "Em Andamento", "Finalizado"];
    const atual = client.status_processo ?? "A Iniciar";
    const indexAtual = ciclo.indexOf(atual);
    const novoIndex = (indexAtual + 1) % ciclo.length;
    const novoStatus = ciclo[novoIndex];

    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status_processo: novoStatus } : c
    ) as Client[]);

    try {
      const { error } = await supabase.from('clients').update({ status_processo: novoStatus }).eq('id', client.id);
      if (error) throw error;
      toast({ title: "Status Atualizado", description: `Novo status: ${novoStatus}`, variant: "default" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
      fetchClients();
    }
  };

  const toggleFase = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    const ciclo: ProcessPhase[] = ["Administrativo", "Judicial", "Execução"];
    const atual = getClientPhase(client);
    const indexAtual = ciclo.indexOf(atual);
    const novoIndex = (indexAtual + 1) % ciclo.length;
    const novaFase = ciclo[novoIndex];

    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, fase_processo: novaFase } : c
    ) as Client[]);

    try {
      const { error } = await supabase.from('clients').update({ fase_processo: novaFase }).eq('id', client.id);
      if (error) throw error;
      toast({ title: "Fase Atualizada", description: `Nova fase: ${novaFase}`, variant: "default" });
    } catch {
      toast({ title: "Não foi possível atualizar a fase", description: "Tente novamente em instantes.", variant: "destructive" });
      fetchClients();
    }
  };

  const getStatusStyle = (status?: BenefitStatus) => {
      switch(status) {
          case 'Finalizado': return { dot: 'bg-emerald-600', badge: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
          case 'Em Andamento': return { dot: 'bg-blue-600', badge: 'border-blue-200 bg-blue-50 text-blue-800' };
          case 'Suspenso': return { dot: 'bg-rose-600', badge: 'border-rose-200 bg-rose-50 text-rose-800' };
          default: return { dot: 'bg-amber-500', badge: 'border-amber-200 bg-amber-50 text-amber-800' };
      }
  };

  const getFaseStyle = (fase?: string) => {
      switch(fase) {
          case 'Judicial': return 'border-blue-200 bg-blue-50 text-blue-800';
          case 'Execução': return 'border-amber-200 bg-amber-50 text-amber-800';
          default: return 'border-slate-200 bg-slate-50 text-slate-700';
      }
  };

  const clientesFiltrados = clients.filter(c => {
      const s = searchTerm.toLowerCase();
      const matchText = s === "" || (c.nome?.toLowerCase()?.includes(s) || c.cpf?.includes(s));
      const matchStatus = statusFilter === "Todos" || (c.status_processo || "A Iniciar") === statusFilter;
      return matchText && matchStatus;
  });

  const stats = {
      iniciar: clients.filter(c => !c.status_processo || c.status_processo === 'A Iniciar').length,
      andamento: clients.filter(c => c.status_processo === 'Em Andamento').length,
      finalizado: clients.filter(c => c.status_processo === 'Finalizado').length,
      total: clients.length
  };

  const mesAtual = new Date().getMonth();
  const aniversariantes = clients.filter(c => {
      if (!c.data_nascimento) return false;
      const parts = c.data_nascimento.split('-');
      if (parts.length !== 3) return false; 
      const mesNasc = parseInt(parts[1], 10) - 1;
      return mesNasc === mesAtual;
  }).sort((a, b) => parseInt(a.data_nascimento!.split('-')[2], 10) - parseInt(b.data_nascimento!.split('-')[2], 10));

  const clientesSemContato = clients.filter(c => !c.telefone?.trim()).length;
  const nomeMesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const metricas = [
    { label: 'Total de clientes', value: stats.total, filter: 'Todos', icon: Users, iconStyle: 'bg-emerald-950 text-white' },
    { label: 'A iniciar', value: stats.iniciar, filter: 'A Iniciar', icon: AlertCircle, iconStyle: 'bg-amber-50 text-amber-700' },
    { label: 'Em andamento', value: stats.andamento, filter: 'Em Andamento', icon: Clock, iconStyle: 'bg-blue-50 text-blue-700' },
    { label: 'Finalizados', value: stats.finalizado, filter: 'Finalizado', icon: CheckCircle, iconStyle: 'bg-emerald-50 text-emerald-700' },
  ];

  const getClientActions = (clientId: number) => [
    { icon: UserCog, route: `/cliente/${clientId}/cadastro`, label: 'Cadastro' },
    { icon: FolderOpen, route: `/documentos/${clientId}`, label: 'Documentos' },
    { icon: Calculator, route: `/analise/${clientId}`, label: 'Análise' },
    { icon: History, route: `/linha-tempo/${clientId}`, label: 'Histórico' },
    { icon: DollarSign, route: `/cliente/${clientId}/financeiro`, label: 'Financeiro' },
  ];

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-background text-foreground">
        <div className="mx-auto w-full max-w-content space-y-6 px-4 py-6 md:px-8 md:py-8">
          <PageHeader
            eyebrow="Escritório PrevRural"
            title="Visão geral"
            description="Acompanhe a carteira e as prioridades do escritório."
            actions={(
              <button
                type="button"
                onClick={() => navigate('/cliente/novo')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <UserPlus size={18} aria-hidden="true" /> Novo cliente
              </button>
            )}
          />

          <section aria-labelledby="portfolio-summary-title">
            <h2 id="portfolio-summary-title" className="sr-only">Resumo da carteira</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metricas.map((metrica) => {
                const isActive = statusFilter === metrica.filter;
                return (
                  <button
                    type="button"
                    key={metrica.filter}
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(metrica.filter)}
                    className={`flex min-h-24 items-center gap-3 rounded-xl border bg-white p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'border-emerald-700 ring-1 ring-emerald-700/10'
                        : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${metrica.iconStyle}`}>
                      <metrica.icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-bold tabular-nums text-slate-950">{metrica.value}</span>
                      <span className="block truncate text-sm font-medium text-slate-600">{metrica.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <section aria-labelledby="clients-title" className="min-w-0 xl:col-span-9">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderOpen size={19} className="text-emerald-800" aria-hidden="true" />
                      <h2 id="clients-title" className="text-lg font-semibold text-slate-950">Carteira de clientes</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {loading ? 'Carregando clientes…' : `${clientesFiltrados.length} resultado${clientesFiltrados.length === 1 ? '' : 's'}`}
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
                    <div className="relative min-w-0 sm:w-72">
                      <label htmlFor="client-search" className="sr-only">Buscar cliente por nome ou CPF</label>
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                      <input
                        id="client-search"
                        type="search"
                        placeholder="Buscar nome ou CPF"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                      />
                    </div>
                    <div className="sm:w-44">
                      <label htmlFor="status-filter" className="sr-only">Filtrar clientes por status</label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                      >
                        <option value="Todos">Todos os status</option>
                        <option value="A Iniciar">A iniciar</option>
                        <option value="Em Andamento">Em andamento</option>
                        <option value="Finalizado">Finalizados</option>
                        <option value="Suspenso">Suspensos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3 p-4" aria-live="polite" aria-busy="true">
                    <span className="sr-only">Carregando carteira de clientes</span>
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : clientesFiltrados.length === 0 ? (
                  <EmptyState
                    className="m-4"
                    icon={<Users aria-hidden="true" />}
                    title="Nenhum cliente encontrado"
                    description="Altere a busca ou o filtro para consultar outros registros."
                    action={(searchTerm || statusFilter !== 'Todos') ? (
                      <button
                        type="button"
                        onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); }}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Limpar filtros
                      </button>
                    ) : undefined}
                  />
                ) : (
                  <>
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1020px] border-collapse">
                        <thead className="bg-slate-50 text-left">
                          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                            <th scope="col" className="px-4 py-3">Cliente</th>
                            <th scope="col" className="px-4 py-3">Contato</th>
                            <th scope="col" className="px-4 py-3">Fase</th>
                            <th scope="col" className="px-4 py-3">Status</th>
                            <th scope="col" className="px-4 py-3 text-right">Acessos rápidos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {clientesFiltrados.map((client) => {
                            const styles = getStatusStyle(client.status_processo);
                            const clientName = client.nome || 'Sem nome';
                            return (
                              <tr key={client.id} className="transition-colors hover:bg-[#f8faf7]">
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/cliente/${client.id}`)}
                                    className="group flex max-w-xs items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                                    aria-label={`Abrir resumo de ${clientName}`}
                                  >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-900">
                                      {clientName.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-900">{clientName}</span>
                                      <span className="mt-0.5 block truncate font-mono text-xs text-slate-500">{client.cpf || 'CPF não informado'}</span>
                                    </span>
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="max-w-56 space-y-1 text-xs text-slate-600">
                                    <p className="flex items-center gap-1.5 truncate"><Phone size={13} className="shrink-0 text-slate-400" aria-hidden="true" /> {client.telefone || 'Sem telefone'}</p>
                                    <p className="flex items-center gap-1.5 truncate"><MapPin size={13} className="shrink-0 text-slate-400" aria-hidden="true" /> {client.cidade || client.endereco || 'Local não informado'}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFase(client, e)}
                                    className={`min-h-8 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${getFaseStyle(getClientPhase(client))}`}
                                    aria-label={`Alterar fase de ${clientName}. Fase atual: ${getClientPhase(client)}`}
                                    title="Clique para avançar a fase"
                                  >
                                    {getClientPhase(client)}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleStatus(client, e)}
                                    className={`inline-flex min-h-8 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${styles.badge}`}
                                    aria-label={`Alterar status de ${clientName}. Status atual: ${client.status_processo || 'A Iniciar'}`}
                                    title="Clique para avançar o status"
                                  >
                                    <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                                    {client.status_processo || 'A Iniciar'}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    {getClientActions(client.id).map((action) => (
                                      <button
                                        type="button"
                                        key={action.label}
                                        onClick={() => navigate(action.route)}
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                        aria-label={`${action.label} de ${clientName}`}
                                        title={action.label}
                                      >
                                        <action.icon size={16} aria-hidden="true" />
                                      </button>
                                    ))}
                                    <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
                                    <button
                                      type="button"
                                      onClick={(e) => void handleDeleteClient(client.id, e)}
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                                      aria-label={`Excluir ${clientName}`}
                                      title="Excluir cliente"
                                    >
                                      <Trash2 size={16} aria-hidden="true" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="divide-y divide-slate-100 lg:hidden">
                      {clientesFiltrados.map((client) => {
                        const styles = getStatusStyle(client.status_processo);
                        const clientName = client.nome || 'Sem nome';
                        return (
                          <article key={client.id} className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => navigate(`/cliente/${client.id}`)}
                                className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                aria-label={`Abrir resumo de ${clientName}`}
                              >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-900">
                                  {clientName.charAt(0).toUpperCase()}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-slate-900">{clientName}</span>
                                  <span className="mt-0.5 block truncate font-mono text-xs text-slate-500">{client.cpf || 'CPF não informado'}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => void handleDeleteClient(client.id, e)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                                aria-label={`Excluir ${clientName}`}
                              >
                                <Trash2 size={17} aria-hidden="true" />
                              </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
                              <p className="flex items-center gap-1.5 truncate"><Phone size={13} className="text-slate-400" aria-hidden="true" /> {client.telefone || 'Sem telefone'}</p>
                              <p className="flex items-center gap-1.5 truncate"><MapPin size={13} className="text-slate-400" aria-hidden="true" /> {client.cidade || client.endereco || 'Local não informado'}</p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={(e) => toggleFase(client, e)}
                                className={`min-h-9 rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${getFaseStyle(getClientPhase(client))}`}
                                aria-label={`Alterar fase de ${clientName}. Fase atual: ${getClientPhase(client)}`}
                              >
                                {getClientPhase(client)}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => toggleStatus(client, e)}
                                className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${styles.badge}`}
                                aria-label={`Alterar status de ${clientName}. Status atual: ${client.status_processo || 'A Iniciar'}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
                                {client.status_processo || 'A Iniciar'}
                              </button>
                            </div>

                            <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-3">
                              {getClientActions(client.id).map((action) => (
                                <button
                                  type="button"
                                  key={action.label}
                                  onClick={() => navigate(action.route)}
                                  className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                  aria-label={`${action.label} de ${clientName}`}
                                >
                                  <action.icon size={15} aria-hidden="true" /> {action.label}
                                </button>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>

            <aside aria-label="Informações auxiliares" className="space-y-4 xl:col-span-3">
              <section aria-labelledby="attention-title" className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-700" aria-hidden="true" />
                  <h2 id="attention-title" className="text-base font-semibold text-slate-950">Atenção operacional</h2>
                </div>
                <div className="mt-3 divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('A Iniciar')}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    <span className="text-slate-600">Clientes aguardando início</span>
                    <span className="font-bold tabular-nums text-slate-900">{stats.iniciar}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('Em Andamento')}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                  >
                    <span className="text-slate-600">Processos em andamento</span>
                    <span className="font-bold tabular-nums text-slate-900">{stats.andamento}</span>
                  </button>
                  <div className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="text-slate-600">Cadastros sem telefone</span>
                    <span className={`font-bold tabular-nums ${clientesSemContato > 0 ? 'text-amber-800' : 'text-slate-900'}`}>{clientesSemContato}</span>
                  </div>
                </div>
              </section>

              <section aria-labelledby="notes-title" className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Edit2 size={17} className="text-emerald-800" aria-hidden="true" />
                    <h2 id="notes-title" className="text-base font-semibold text-slate-950">Lembretes</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{notes.length}</span>
                </div>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => { event.preventDefault(); void addNote(); }}
                >
                  <label htmlFor="new-note" className="sr-only">Novo lembrete</label>
                  <input
                    id="new-note"
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Adicionar lembrete"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-950 text-white hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Adicionar lembrete"
                  >
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </form>

                <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                  {notes.length === 0 ? (
                    <p className="rounded-lg bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">Nenhum lembrete registrado.</p>
                  ) : (
                    notes.map((note) => {
                      const isExpanded = expandedNotes[note.id] || false;
                      const isLongText = note.texto.length > 150;
                      const isEditing = editingNoteId === note.id;

                      return (
                        <div key={note.id} className="rounded-lg border border-slate-200 p-3">
                          {isEditing ? (
                            <div className="space-y-2">
                              <label htmlFor={`note-${note.id}`} className="sr-only">Editar lembrete</label>
                              <textarea
                                id={`note-${note.id}`}
                                value={editNoteText}
                                onChange={(e) => setEditNoteText(e.target.value)}
                                className="w-full resize-none rounded-lg border border-slate-300 p-2 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setEditingNoteId(null)} className="min-h-9 rounded-lg px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancelar</button>
                                <button type="button" onClick={() => void updateNote(note.id)} className="min-h-9 rounded-lg bg-emerald-950 px-3 text-xs font-semibold text-white hover:bg-emerald-900">Salvar</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start gap-2">
                                <p className={`min-w-0 flex-1 break-words text-sm leading-5 text-slate-700 ${isExpanded ? '' : 'line-clamp-3'}`}>{note.texto}</p>
                                <div className="flex shrink-0 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.texto); }}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                    aria-label="Editar lembrete"
                                  >
                                    <Edit2 size={14} aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void removeNote(note.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                                    aria-label="Excluir lembrete"
                                  >
                                    <Trash2 size={14} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                              {isLongText && (
                                <button
                                  type="button"
                                  onClick={() => toggleNoteExpansion(note.id)}
                                  className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                  aria-expanded={isExpanded}
                                >
                                  {isExpanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                                  {isExpanded ? 'Ver menos' : 'Ver mais'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section aria-labelledby="birthdays-title" className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cake size={17} className="text-amber-700" aria-hidden="true" />
                    <h2 id="birthdays-title" className="text-base font-semibold text-slate-950">Aniversariantes</h2>
                  </div>
                  <span className="text-xs font-medium capitalize text-slate-500">{nomeMesAtual}</span>
                </div>

                {aniversariantes.length === 0 ? (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-5 text-center text-sm text-slate-500">Nenhum aniversário neste mês.</p>
                ) : (
                  <div className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto">
                    {aniversariantes.map((client) => {
                      const phone = client.telefone?.replace(/\D/g, '') || '';
                      return (
                        <div key={client.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-900">
                            <span className="text-xs font-semibold leading-none">dia</span>
                            <span className="text-base font-bold leading-none tabular-nums">{client.data_nascimento?.split('-')[2]}</span>
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{client.nome}</p>
                            <button
                              type="button"
                              disabled={!phone}
                              onClick={() => window.open(`https://wa.me/55${phone}`, '_blank', 'noopener,noreferrer')}
                              className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
                              aria-label={phone ? `Enviar mensagem para ${client.nome}` : `${client.nome} não possui telefone cadastrado`}
                            >
                              <MessageCircle size={14} aria-hidden="true" /> {phone ? 'Enviar mensagem' : 'Sem telefone'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
