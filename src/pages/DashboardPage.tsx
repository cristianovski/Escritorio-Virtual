import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserPlus, Search, Filter, Clock, Calendar, 
  CheckCircle, AlertCircle, ChevronRight, Star, 
  MessageCircle, FolderOpen, Trash2, PieChart, 
  UserCog, Calculator, BookCheck, DollarSign, History,
  MapPin, Phone, Cake, Plus
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { Client, BenefitStatus } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchClients();
    try {
        const savedNotes = localStorage.getItem("dashboardNotes");
        if (savedNotes) setNotes(JSON.parse(savedNotes));
    } catch (error) {
        localStorage.removeItem("dashboardNotes");
    }
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setClients(data as Client[]);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        toast({ title: "Erro", description: "Falha ao carregar clientes: " + msg, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteClient = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("ATENÇÃO: Apagar este cliente removerá tudo (ficha, documentos, histórico). Continuar?")) {
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            toast({ title: "Sucesso", description: "Cliente removido.", variant: "success" });
            fetchClients();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Erro ao excluir";
            toast({ title: "Erro", description: msg, variant: "destructive" });
        }
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
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
      fetchClients();
    }
  };

  const addNote = () => {
      if (!newNote.trim()) return;
      const updated = [...notes, newNote];
      setNotes(updated);
      setNewNote("");
      localStorage.setItem("dashboardNotes", JSON.stringify(updated));
  };

  const removeNote = (idx: number) => {
      const updated = notes.filter((_, i) => i !== idx);
      setNotes(updated);
      localStorage.setItem("dashboardNotes", JSON.stringify(updated));
  };

  const getStatusStyle = (status?: BenefitStatus) => {
      switch(status) {
          case 'Finalizado': return { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
          case 'Em Andamento': return { bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 ring-blue-200' };
          default: return { bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 ring-amber-200' };
      }
  };

  const clientesFiltrados = clients.filter(c => {
      const s = searchTerm.toLowerCase();
      const matchText = c.nome?.toLowerCase().includes(s) || c.cpf?.includes(s);
      const matchStatus = statusFilter === "Todos" || (c.status_processo || "A Iniciar") === statusFilter;
      return matchText && matchStatus;
  });

  const stats = {
      iniciar: clients.filter(c => !c.status_processo || c.status_processo === 'A Iniciar').length,
      andamento: clients.filter(c => c.status_processo === 'Em Andamento').length,
      finalizado: clients.filter(c => c.status_processo === 'Finalizado').length,
      total: clients.length || 1
  };

  const mesAtual = new Date().getMonth();
  const aniversariantes = clients.filter(c => {
      if (!c.data_nascimento) return false;
      const parts = c.data_nascimento.split('-');
      if (parts.length !== 3) return false; 
      const mesNasc = parseInt(parts[1], 10) - 1;
      return mesNasc === mesAtual;
  }).sort((a, b) => parseInt(a.data_nascimento!.split('-')[2], 10) - parseInt(b.data_nascimento!.split('-')[2], 10));

  const pieData = [
    { name: 'A Iniciar', value: stats.iniciar, color: '#f59e0b' },
    { name: 'Em Andamento', value: stats.andamento, color: '#3b82f6' },
    { name: 'Finalizado', value: stats.finalizado, color: '#10b981' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
            <p className="text-slate-500 font-medium mt-1">Bem-vindo(a). Aqui está o resumo da sua operação.</p>
          </div>
          <button 
            onClick={() => navigate('/cliente/novo')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <UserPlus size={20} /> Novo Cliente
          </button>
        </div>

        {/* ESTATÍSTICAS (4 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total na Carteira', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'A Iniciar', value: stats.iniciar, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Em Andamento', value: stats.andamento, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Finalizados', value: stats.finalizado, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800 leading-none mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* LAYOUT PRINCIPAL (2 COLUNAS: ESQUERDA LISTA, DIREITA WIDGETS) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA (Filtros e Clientes) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Filtros */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-700 font-medium"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {["Todos", "A Iniciar", "Em Andamento", "Finalizado"].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                      statusFilter === st 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Clientes */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FolderOpen className="text-slate-400" size={20}/> Clientes Recentes
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl h-48 border border-slate-200 animate-pulse"></div>
                  ))}
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4"><Users size={40} className="text-slate-300" /></div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum cliente encontrado</h3>
                  <p className="text-slate-500 text-sm mb-6">Ajuste os filtros ou cadastre um novo cliente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientesFiltrados.map((client) => {
                    const styles = getStatusStyle(client.status_processo);
                    return (
                      <div 
                        key={client.id} 
                        onClick={() => navigate(`/cliente/${client.id}`)} 
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative flex flex-col"
                      >
                        {/* Linha colorida de status lateral */}
                        <div 
                          className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-md transition-all ${styles.bg}`}
                          title="Status do Processo"
                        ></div>

                        <div className="flex justify-between items-start mb-4 pl-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black text-lg group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                              {client.nome?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {client.nome}
                              </h3>
                              <p className="text-xs text-slate-400 font-mono mt-1">{client.cpf}</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => toggleStatus(client, e)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ring-1 transition-colors ${styles.light} hover:opacity-80`}
                          >
                            {client.status_processo || 'A Iniciar'}
                          </button>
                        </div>

                        {/* Dados de Contato */}
                        <div className="space-y-1.5 mb-5 pl-3">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={13} className="text-slate-400" />
                            <span className="truncate font-medium">{client.cidade || client.endereco || 'Endereço não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={13} className="text-slate-400" />
                            <span className="font-medium">{client.telefone || 'Sem telefone'}</span>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between pl-3">
                           <div className="flex gap-1.5">
                              {[
                                { icon: UserCog, route: `/cliente/${client.id}`, color: 'hover:text-blue-600 hover:bg-blue-50', title: 'Ficha Cadastral' },
                                { icon: Calculator, route: `/analise/${client.id}`, color: 'hover:text-amber-600 hover:bg-amber-50', title: 'Calculadora' },
                                { icon: FolderOpen, route: `/documentos/${client.id}`, color: 'hover:text-indigo-600 hover:bg-indigo-50', title: 'Inventário GED' },
                                { icon: History, route: `/linha-tempo/${client.id}`, color: 'hover:text-orange-600 hover:bg-orange-50', title: 'Linha do Tempo' },
                                { icon: DollarSign, route: `/cliente/${client.id}/financeiro`, color: 'hover:text-emerald-600 hover:bg-emerald-50', title: 'Financeiro' },
                              ].map((btn, i) => (
                                <button 
                                  key={i}
                                  onClick={(e) => { e.stopPropagation(); navigate(btn.route); }} 
                                  className={`p-2 rounded-lg text-slate-400 transition-colors ${btn.color}`}
                                  title={btn.title}
                                >
                                  <btn.icon size={16} strokeWidth={2.5}/>
                                </button>
                              ))}
                           </div>
                           <button 
                             onClick={(e) => handleDeleteClient(client.id, e)} 
                             className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                             title="Excluir Cliente"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA (Widgets: Gráfico, Aniversários, Lembretes) */}
          <div className="space-y-6">
            
            {/* Gráfico de Distribuição */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                <PieChart size={16} className="text-slate-400" /> Distribuição
              </h3>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-6">
                  <div className="absolute inset-0 rounded-full shadow-inner"
                       style={{ 
                         background: `conic-gradient(
                           #f59e0b 0deg ${(stats.iniciar / stats.total) * 360}deg,
                           #3b82f6 ${(stats.iniciar / stats.total) * 360}deg ${((stats.iniciar + stats.andamento) / stats.total) * 360}deg,
                           #10b981 ${((stats.iniciar + stats.andamento) / stats.total) * 360}deg 360deg
                         )`
                       }}>
                  </div>
                  <div className="absolute inset-3 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                    <span className="text-2xl font-black text-slate-800 leading-none">{stats.total}</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Aniversariantes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Cake size={16} className="text-rose-500" /> Aniversariantes
                </h3>
                <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg">
                  {aniversariantes.length} NO MÊS
                </span>
              </div>
              {aniversariantes.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-medium text-slate-400">Nenhum cliente faz aniversário este mês.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {aniversariantes.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-rose-50/50 hover:bg-rose-50 transition-colors rounded-xl border border-rose-100/50 group">
                      <div className="w-12 h-12 bg-white border border-rose-100 rounded-xl flex flex-col items-center justify-center text-rose-600 shadow-sm">
                        <span className="text-[9px] font-bold uppercase leading-none mb-0.5 opacity-60">Dia</span>
                        <span className="text-lg font-black leading-none">{c.data_nascimento?.split('-')[2]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{c.nome}</p>
                        <button
                          onClick={() => window.open(`https://wa.me/55${c.telefone?.replace(/\D/g, '') || ''}`, '_blank')}
                          className="text-[10px] text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 mt-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <MessageCircle size={12} /> Enviar Mensagem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lembretes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-80">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide mb-4">
                <Star size={16} className="text-amber-500" /> Lembretes Rápidos
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  placeholder="Escreva um lembrete..."
                  className="flex-1 bg-amber-50/50 border border-amber-200/50 rounded-xl px-3 py-2 text-sm focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-slate-700 placeholder:text-amber-700/40 transition-all"
                />
                <button
                  onClick={addNote}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-2 rounded-xl font-bold transition-colors"
                >
                  <Plus size={18}/>
                </button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {notes.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-xs font-medium text-slate-400">Caixa de lembretes vazia.</p>
                  </div>
                ) : (
                  notes.map((note, i) => (
                    <div key={i} className="flex items-start justify-between p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 group hover:border-amber-200 transition-colors">
                      <span className="text-sm font-medium text-slate-700 leading-snug break-words pr-2">{note}</span>
                      <button
                        onClick={() => removeNote(i)}
                        className="text-slate-300 hover:text-red-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}