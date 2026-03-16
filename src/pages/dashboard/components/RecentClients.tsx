import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, ChevronRight, MapPin, Phone, MessageCircle,
  FolderOpen, BrainCircuit, Trash2, UserCog, Calculator,
  BookCheck, FileText, DollarSign, History
} from "lucide-react";
import { Client } from "../../../types";
import { getStatusColor } from "../utils";

interface RecentClientsProps {
  loading: boolean;
  clientesFiltrados: Client[];
  toggleStatus: (client: Client, e: React.MouseEvent) => void;
  handleDeleteClient: (id: number, e: React.MouseEvent) => void;
}

export function RecentClients({
  loading,
  clientesFiltrados,
  toggleStatus,
  handleDeleteClient
}: RecentClientsProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Últimos Clientes</h2>
        <button
          onClick={() => navigate('/clientes')}
          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
        >
          Ver todos <ChevronRight size={16} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-5 w-3/4 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-slate-500 mb-4">Que tal cadastrar seu primeiro cliente agora?</p>
          <button
            onClick={() => navigate('/cliente/novo')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-medium inline-flex items-center gap-2"
          >
            <UserPlus size={18} />
            Novo Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.slice(0, 6).map((client) => (
            <div
              key={client.id}
              onClick={() => navigate(`/cliente/${client.id}`)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group overflow-hidden relative"
            >
              {/* Barra lateral de status (clicável para alterar status) */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 cursor-pointer hover:w-2.5 transition-all ${getStatusColor(client.status_processo)}`}
                onClick={(e) => toggleStatus(client, e)}
                title="Clique para alterar status"
              ></div>

              <div className="pl-6 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {client.nome?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {client.nome}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{client.cpf}</p>
                    </div>
                  </div>
                </div>

                {/* Informações de contato */}
                <div className="space-y-2 mb-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate text-xs">{client.cidade || client.endereco || 'Local não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate text-xs">{client.telefone || 'Sem telefone'}</span>
                  </div>
                </div>

                {/* Botões de ação (restaurados) */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 flex-wrap">
                  {/* Grupo 1: Ficha e WhatsApp */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/cliente/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Ficha do Cliente"
                    >
                      <UserCog size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${client.telefone?.replace(/\D/g, '') || ''}`, '_blank'); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>

                  <div className="w-px h-6 bg-slate-200"></div>

                  {/* Grupo 2: Calculadora e Parecer IA */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/analise/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      title="Calculadora Estratégica"
                    >
                      <Calculator size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/parecer/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      title="Parecer IA"
                    >
                      <BrainCircuit size={16} />
                    </button>
                  </div>

                  <div className="w-px h-6 bg-slate-200"></div>

                  {/* Grupo 3: GED, Procuração, Dossiê, Timeline e Financeiro */}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/documentos/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Documentos (GED)"
                    >
                      <FolderOpen size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/procuracao/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                      title="Procuração"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/dossie/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors"
                      title="Dossiê Completo"
                    >
                      <BookCheck size={16} />
                    </button>
                    {/* NOVO BOTÃO LINHA DO TEMPO */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/linha-tempo/${client.id}`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      title="Linha do Tempo"
                    >
                      <History size={16} />
                    </button>
                    {/* FINANCEIRO */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/cliente/${client.id}/financeiro`); }}
                      className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      title="Financeiro do Cliente"
                    >
                      <DollarSign size={16} />
                    </button>
                  </div>

                  <div className="flex-1"></div>

                  {/* Botão deletar */}
                  <button
                    onClick={(e) => handleDeleteClient(client.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Excluir cliente"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
