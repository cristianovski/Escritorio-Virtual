import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserPlus, Search, AlertCircle, Clock, Calendar, 
  CheckCircle, ChevronRight, Star, MessageCircle, 
  FolderOpen, Trash2, UserCog, Calculator, 
  DollarSign, History, MapPin, Phone, Cake, Plus,
  ChevronDown, ChevronUp, Edit2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";
import { Client, BenefitStatus } from "../types";

interface Note {
  id: string;
  texto: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchClients();
    fetchNotes(); 
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

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase.from('dashboard_notes').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        setNotes(data as Note[]);
      }
    } catch (err) {
      console.error("Erro ao carregar lembretes:", err);
    }
  };

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

  const toggleFase = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    const ciclo = ["Administrativo", "Judicial", "Execução"];
    const atual = (client as any).fase_processo ?? "Administrativo";
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
    } catch (err) {
      toast({ title: "Erro", description: "Verifique se a coluna 'fase_processo' existe no Supabase.", variant: "destructive" });
      fetchClients();
    }
  };

  const getStatusStyle = (status?: BenefitStatus) => {
      switch(status) {
          case 'Finalizado': return { bg: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
          case 'Em Andamento': return { bg: 'bg-blue-500', light: 'bg-blue-50 text-blue-700 ring-blue-200' };
          default: return { bg: 'bg-amber-500', light: 'bg-amber-50 text-amber-700 ring-amber-200' };
      }
  };

  const getFaseStyle = (fase?: string) => {
      switch(fase) {
          case 'Judicial': return 'bg-purple-50 text-purple-700 ring-purple-200';
          case 'Execução': return 'bg-rose-50 text-rose-700 ring-rose-200';
          default: return 'bg-slate-100 text-slate-600 ring-slate-200'; 
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

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
            <p className="text-slate-500 font-medium mt-1">Bem-vindo(a). Aqui está o resumo da sua operação.</p>
          </div>
          <button 
            onClick={() => navigate('/cliente/novo')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95 shrink-0"
          >
            <UserPlus size={20} /> Novo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Total na Carteira', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'A Iniciar', value: stats.iniciar, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-indigo-50' },
            { label: 'Em Andamento', value: stats.andamento, icon: Clock, color: 'text-blue-600', bg: 'bg-indigo-50' },
            { label: 'Finalizados', value: stats.finalizado, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-indigo-50' },
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <div className="xl:col-span-3 space-y-6">
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center">
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
              <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
                {["Todos", "A Iniciar", "Em Andamento", "Finalizado"].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
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

            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FolderOpen className="text-slate-400" size={20}/> Clientes Recentes
                </h2>
              </div>

              {loading ? (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl h-24 border border-slate-200 animate-pulse"></div>
                  ))}
                </div>
              ) : clientesFiltrados.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-4"><Users size={40} className="text-slate-300" /></div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum cliente encontrado</h3>
                  <p className="text-slate-500 text-sm mb-6">Ajuste os filtros ou cadastre um novo cliente.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {clientesFiltrados.map((client) => {
                    const styles = getStatusStyle(client.status_processo);
                    return (
                      <div 
                        key={client.id} 
                        onClick={() => navigate(`/cliente/${client.id}`)} 
                        className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
                      >
                        <div 
                          className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-md transition-all ${styles.bg}`}
                          title="Status do Processo"
                        ></div>

                        <div className="flex justify-between items-start md:items-center pl-3 md:w-[35%] shrink-0">
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 font-black text-lg group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors shrink-0">
                              {client.nome ? client.nome.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="min-w-0 pr-2">
                              <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-emerald-700 transition-colors truncate">
                                {client.nome || 'Sem Nome'}
                              </h3>
                              <p className="text-xs text-slate-400 font-mono mt-1 truncate">{client.cpf || 'Sem CPF'}</p>
                            </div>
                          </div>
                          
                          <div className="md:hidden flex flex-col gap-1.5 shrink-0">
                            <button 
                              onClick={(e) => toggleFase(client, e)}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md ring-1 transition-colors whitespace-nowrap text-center ${getFaseStyle((client as any).fase_processo)} hover:opacity-80`}
                            >
                              {(client as any).fase_processo || 'Administrativo'}
                            </button>
                            <button 
                              onClick={(e) => toggleStatus(client, e)}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md ring-1 transition-colors whitespace-nowrap text-center ${styles.light} hover:opacity-80`}
                            >
                              {client.status_processo || 'A Iniciar'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 pl-3 md:pl-0 md:flex-1 md:flex md:flex-col md:justify-center min-w-0 hidden md:flex">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={13} className="text-slate-400 shrink-0" />
                            <span className="truncate font-medium">{client.cidade || client.endereco || 'Endereço não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span className="font-medium truncate">{client.telefone || 'Sem telefone'}</span>
                          </div>
                        </div>

                        <div className="pt-4 md:pt-0 border-t border-slate-100 md:border-none flex items-center justify-between md:justify-end gap-6 pl-3 md:pl-0 shrink-0">
                           
                           <div className="hidden md:flex items-center gap-2 shrink-0">
                             <button 
                               onClick={(e) => toggleFase(client, e)}
                               className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ring-1 transition-colors whitespace-nowrap ${getFaseStyle((client as any).fase_processo)} hover:opacity-80`}
                             >
                               {(client as any).fase_processo || 'Administrativo'}
                             </button>
                             <button 
                               onClick={(e) => toggleStatus(client, e)}
                               className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ring-1 transition-colors whitespace-nowrap ${styles.light} hover:opacity-80`}
                             >
                               {client.status_processo || 'A Iniciar'}
                             </button>
                           </div>

                           <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                              {[
                                { icon: UserCog, route: `/cliente/${client.id}`, color: 'hover:text-blue-600 hover:bg-blue-50', title: 'Ficha Cadastral' },
                                { icon: FolderOpen, route: `/documentos/${client.id}`, color: 'hover:text-indigo-600 hover:bg-indigo-50', title: 'Inventário GED' },
                                { icon: DollarSign, route: `/cliente/${client.id}/financeiro`, color: 'hover:text-emerald-600 hover:bg-emerald-50', title: 'Financeiro' },
                                { icon: Calculator, route: `/analise/${client.id}`, color: 'hover:text-amber-600 hover:bg-amber-50', title: 'Calculadora' },
                                { icon: History, route: `/linha-tempo/${client.id}`, color: 'hover:text-orange-600 hover:bg-orange-50', title: 'Linha do Tempo' },
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
                             className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
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

          <div className="space-y-6 xl:col-span-1 flex flex-col">
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col flex-1 min-h-[400px]">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide mb-4">
                <Star size={16} className="text-amber-500" /> Lembretes na Nuvem
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
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-2 rounded-xl font-bold transition-colors shrink-0"
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
                  notes.map((note) => {
                    const isExpanded = expandedNotes[note.id] || false;
                    const isLongText = note.texto.length > 150;
                    const isEditing = editingNoteId === note.id;

                    return (
                      <div key={note.id} className="flex flex-col p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 group hover:border-amber-200 transition-colors">
                        
                        {isEditing ? (
                          <div className="flex flex-col gap-2 w-full">
                            <textarea
                              value={editNoteText}
                              onChange={(e) => setEditNoteText(e.target.value)}
                              className="w-full text-sm p-2 rounded border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none"
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingNoteId(null)} className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1">Cancelar</button>
                              <button onClick={() => updateNote(note.id)} className="text-xs bg-amber-500 text-white font-bold px-3 py-1 rounded hover:bg-amber-600 transition-colors">Salvar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between">
                              <span className={`text-sm font-medium text-slate-700 leading-snug break-words pr-2 ${isExpanded ? '' : 'line-clamp-3'}`}>
                                {note.texto}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditNoteText(note.texto);
                                  }}
                                  className="text-slate-300 hover:text-blue-500 mt-0.5 transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeNote(note.id)}
                                  className="text-slate-300 hover:text-red-500 mt-0.5 transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {isLongText && (
                              <button 
                                onClick={() => toggleNoteExpansion(note.id)}
                                className="text-amber-700 text-xs font-bold mt-2 flex items-center gap-1 hover:text-amber-900 w-fit"
                              >
                                {isExpanded ? (
                                  <><ChevronUp size={14} /> Ver menos</>
                                ) : (
                                  <><ChevronDown size={14} /> Ver mais</>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[280px] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Cake size={16} className="text-rose-500" /> Aniversariantes
                </h3>
                <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-1 rounded-lg">
                  {aniversariantes.length} NO MÊS
                </span>
              </div>
              {aniversariantes.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 flex-1 flex items-center justify-center">
                  <p className="text-xs font-medium text-slate-400">Nenhum cliente faz aniversário este mês.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {aniversariantes.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-rose-50/50 hover:bg-rose-50 transition-colors rounded-xl border border-rose-100/50 group">
                      <div className="w-12 h-12 bg-white border border-rose-100 rounded-xl flex flex-col items-center justify-center text-rose-600 shadow-sm shrink-0">
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

          </div>
        </div>
      </div>
    </div>
  );
}