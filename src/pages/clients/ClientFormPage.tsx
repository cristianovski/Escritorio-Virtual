import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, User, Tractor, Calculator
} from "lucide-react";
import { CivilDataForm } from "../../components/clients/CivilDataForm";
import { RuralDataForm } from "../../components/clients/RuralDataForm";
import { Client } from "../../types";
import { useClientForm } from "../../hooks/useClientForm";

interface ClientFormProps {
  cliente?: Client | null;
  onBack: () => void;
}

export function ClientFormPage({ cliente, onBack }: ClientFormProps) {
  const navigate = useNavigate();
  
  const {
    loading,
    activeTab,
    setActiveTab,
    civilData,
    ruralData,
    historico,
    handleCivilSubmit,
    handleRuralSave,
    handleSave
  } = useClientForm({ cliente });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b p-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="text-slate-600"/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{cliente ? "Editar Cadastro" : "Novo Cliente"}</h1>
            <p className="text-xs text-slate-500 font-medium">Dossiê Completo</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {cliente && (
            <button onClick={() => navigate(`/analise/${cliente.id}`)} className="hidden md:flex bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg font-bold text-sm items-center gap-2 transition">
              <Calculator size={16}/> Calculadora
            </button>
          )}
          <button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            <Save size={18}/> {loading ? "Salvando..." : "Salvar Tudo"}
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="bg-white border-b px-4 flex gap-6 sticky top-[73px] z-10">
        <button onClick={() => setActiveTab('civil')} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'civil' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <User size={18}/> Dados Civis
        </button>
        <button onClick={() => setActiveTab('rural')} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'rural' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Tractor size={18}/> Ficha Rural
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-32">
        {activeTab === 'civil' && (
          <CivilDataForm
            initialData={civilData}
            onSubmit={handleCivilSubmit}
            loading={loading}
          />
        )}
        {activeTab === 'rural' && (
          <RuralDataForm
            initialData={ruralData}
            historico={historico}
            onSave={handleRuralSave}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
}