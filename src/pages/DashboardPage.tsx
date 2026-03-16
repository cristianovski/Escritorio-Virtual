import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, UserPlus, Search, Filter, Clock, Calendar, 
  CheckCircle, AlertCircle, ChevronRight, Star, 
  MessageCircle, FolderOpen, Trash2, PieChart, 
  UserCog, Calculator, BookCheck, DollarSign, History
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

  const getStatusColor = (status?: BenefitStatus): string => {
      switch(status) {
          case 'Finalizado': return 'bg-emerald-500';
          case 'Em Andamento': return 'bg-blue-500';
          default: return 'bg-amber-400';
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Bem-vindo de volta! Resumo da sua carteira.</p>
          </div>
          <button 
            onClick={() => navigate('/cliente/novo')}
            className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus size={20} /> Novo Cliente
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
            <p className="text-sm text-slate-500">Total de Clientes</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800">{stats.iniciar}</h3>
            <p className="text-sm text-slate-500">A Iniciar</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800">{stats.andamento}</h3>
            <p className="text-sm text-slate-500">Em Andamento</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-800">{stats.finalizado}</h3>
            <p className="text-sm text-slate-500">Finalizados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-slate-400" /> Distribuição
            </h3>
            <div className="w-full space-y-2">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-medium text-slate-800">{item.value}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Filter size={18} className="text-slate-400" /> Filtros e Pesquisa
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {["Todos", "A Iniciar", "Em Andamento", "Finalizado"].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      statusFilter === st ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Últimos Clientes</h2>
          </div>

          {loading ? (
             <p className="text-slate-500">Carregando...</p>
          ) : clientesFiltrados.length === 0 ? (
            <p className="text-slate-500">Nenhum cliente encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientesFiltrados.slice(0, 6).map((client) => (
                <div key={client.id} onClick={() => navigate(`/cliente/${client.id}`)} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group overflow-hidden relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-pointer hover:w-2.5 transition-all ${getStatusColor(client.status_processo)}`} onClick={(e) => toggleStatus(client, e)}></div>
                  <div className="pl-6 p-6">
                    <h3 className="font-semibold text-slate-800">{client.nome}</h3>
                    <p className="text-xs text-slate-500 font-mono mb-4">{client.cpf}</p>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 flex-wrap">
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/cliente/${client.id}`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600" title="Ficha"><UserCog size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${client.telefone?.replace(/\D/g, '') || ''}`, '_blank'); }} className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600" title="WhatsApp"><MessageCircle size={16} /></button>
                      </div>
                      <div className="w-px h-6 bg-slate-200"></div>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/analise/${client.id}`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600" title="Calculadora"><Calculator size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/documentos/${client.id}`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600" title="GED"><FolderOpen size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/dossie/${client.id}`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-cyan-50 text-slate-600" title="Dossiê"><BookCheck size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/linha-tempo/${client.id}`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-600" title="Linha do Tempo"><History size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/cliente/${client.id}/financeiro`); }} className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600" title="Financeiro"><DollarSign size={16} /></button>
                      </div>
                      <div className="flex-1"></div>
                      <button onClick={(e) => handleDeleteClient(client.id, e)} className="p-2 rounded-lg text-slate-400 hover:text-red-600" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}