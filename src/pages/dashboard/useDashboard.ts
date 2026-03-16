import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../hooks/use-toast";
import { Client, BenefitStatus } from "../../types";

export function useDashboard() {
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
        console.error("Erro ao ler notas do cache", error);
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
      const { error } = await supabase
        .from('clients')
        .update({ status_processo: novoStatus })
        .eq('id', client.id);
      if (error) throw error;
      toast({ title: "Status Atualizado", description: `Novo status: ${novoStatus}`, variant: "default" });
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível atualizar o status.", variant: "destructive" });
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

  return {
    clients,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    notes,
    newNote,
    setNewNote,
    fetchClients,
    handleDeleteClient,
    toggleStatus,
    addNote,
    removeNote,
    clientesFiltrados,
    stats,
    aniversariantes,
    pieData
  };
}
