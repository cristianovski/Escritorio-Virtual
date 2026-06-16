import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Users, Plus, Search
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Client } from "../../types";
import { ClientCard } from "./components/ClientCard";
import { ClientListEmptyState } from "./components/ClientListEmptyState";

export function ClientListPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) setClients(data as Client[]); 
      
    } catch (err: unknown) { 
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao carregar clientes";
      console.error("Falha na listagem:", msg);
      alert("Não foi possível carregar a lista de clientes. Verifique a sua ligação.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const search = searchTerm.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(search) ||
      c.cpf?.includes(search)
    );
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-emerald-600"/> Carteira de Clientes
            </h1>
            <p className="text-slate-500 text-sm font-medium">Gerencie seus segurados rurais e processos</p>
          </div>
          
          <button 
            onClick={() => navigate('/cliente/novo')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
          >
            <Plus size={20}/> Novo Cliente
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="relative shadow-sm">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20}/>
            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="w-full pl-12 p-3.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-slate-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="text-sm font-medium">Carregando carteira...</p>
             </div>
          ) : filteredClients.length === 0 ? (
             <ClientListEmptyState onNewClient={() => navigate('/cliente/novo')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {filteredClients.map(client => (
                <ClientCard
                  key={client.id} 
                  client={client}
                  onClick={() => navigate(`/cliente/${client.id}`)} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}