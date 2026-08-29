import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, User, PenTool, Tractor
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../hooks/use-toast";
import { getLocalDateISO } from "../../lib/utils";
import { CivilDataForm } from "../../components/clients/CivilDataForm";
import { RuralDataForm } from "../../components/clients/RuralDataForm";
import {
  civilSchema,
  CivilFormValues,
  ruralSchema,
  RuralFormValues,
} from "../../schemas/clientSchemas";
import { Client, Period } from "../../types";

interface ClientFormProps {
  cliente?: Client | null;
  onBack: () => void;
}

export function ClientFormPage({ cliente, onBack }: ClientFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'civil' | 'rural' | 'anamnese'>('civil');
  
  const [civilData, setCivilData] = useState<Partial<CivilFormValues>>({});
  const [ruralData, setRuralData] = useState<Partial<RuralFormValues>>({});
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [historico, setHistorico] = useState(""); 
  const [timeline, setTimeline] = useState<Period[]>([]);
  const clientId = cliente?.id;

  const loadFullData = useCallback(async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const [clientRes, interviewRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', clientId).single(),
        supabase.from('interviews').select('*').eq('client_id', clientId).maybeSingle()
      ]);

      if (clientRes.error) throw clientRes.error;
      
      if (clientRes.data) {
        const mapped: CivilFormValues = {
          nome: clientRes.data.nome || "",
          cpf: clientRes.data.cpf || "",
          data_nascimento: clientRes.data.data_nascimento || "",
          sexo: clientRes.data.sexo || "Masculino",
          analfabeto: clientRes.data.analfabeto || false,
          capacidade_civil: clientRes.data.capacidade_civil || "Plena",
          rep_nome: clientRes.data.rep_nome || "",
          rep_cpf: clientRes.data.rep_cpf || "",
          rep_rg: clientRes.data.rep_rg || "",
          rep_parentesco: clientRes.data.rep_parentesco || "",
          rep_endereco: clientRes.data.rep_endereco || "",
          rep_telefone: clientRes.data.rep_telefone || "",
          rg: clientRes.data.rg || "",
          orgao_expedidor: clientRes.data.orgao_expedidor || "",
          data_expedicao: clientRes.data.data_expedicao || "",
          nit: clientRes.data.nit || "",
          ctps: clientRes.data.ctps || "",
          nome_mae: clientRes.data.nome_mae || "",
          nome_pai: clientRes.data.nome_pai || "",
          estado_civil: clientRes.data.estado_civil || "Solteiro(a)",
          nome_conjuge: clientRes.data.nome_conjuge || "",
          cpf_conjuge: clientRes.data.cpf_conjuge || "",
          cep: clientRes.data.cep || "",
          endereco: clientRes.data.endereco || "",
          bairro: clientRes.data.bairro || "",
          cidade: clientRes.data.cidade || "",
          telefone: clientRes.data.telefone || "",
          telefone_recado: clientRes.data.telefone_recado || "",
          resumo_cnis: clientRes.data.resumo_cnis || "",
          historico_beneficios: clientRes.data.historico_beneficios || "",
          possui_cnpj: clientRes.data.possui_cnpj || false,
          detalhes_cnpj: clientRes.data.detalhes_cnpj || "",
          possui_outra_renda: clientRes.data.possui_outra_renda || false,
          detalhes_renda: clientRes.data.detalhes_renda || "",
          endereco_divergente: clientRes.data.endereco_divergente || false,
          justificativa_endereco: clientRes.data.justificativa_endereco || "",
          status_processo: clientRes.data.status_processo || "A Iniciar",
        };
        setCivilData(mapped);
      }

      setHistorico(interviewRes.data?.historico_locais || "");
      setTimeline(
        Array.isArray(interviewRes.data?.timeline_json)
          ? interviewRes.data.timeline_json as Period[]
          : []
      );

      const mappedRural = interviewRes.data?.dados_rurais
        ? interviewRes.data.dados_rurais as RuralFormValues
        : {};
      setRuralData(mappedRural);
      setFormResetVersion((version) => version + 1);
    } catch (error) {
      console.error("Erro:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
    } finally {
      setLoading(false);
    }
  }, [clientId, toast]);

  useEffect(() => {
    if (clientId) void loadFullData();
  }, [clientId, loadFullData]);

  const handleCivilSubmit = (data: CivilFormValues) => {
    setCivilData(data);
  };

  const handleRuralSave = (data: RuralFormValues) => {
    setRuralData(data);
  };

  const handleSave = async () => {
    const validatedCivil = civilSchema.safeParse(civilData);
    if (!validatedCivil.success) {
      const fieldLabels: Record<string, string> = {
        nome: "nome completo",
        cpf: "CPF",
        data_nascimento: "data de nascimento",
        sexo: "sexo",
        analfabeto: "alfabetização",
        capacidade_civil: "capacidade civil",
      };
      const invalidFields = Array.from(new Set(
        validatedCivil.error.issues.map((issue) => (
          fieldLabels[String(issue.path[0])] || String(issue.path[0])
        ))
      ));

      setActiveTab("civil");
      toast({
        title: "Revise os dados civis",
        description: `Campos inválidos ou ausentes: ${invalidFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    const validatedRural = ruralSchema.safeParse(ruralData);
    if (!validatedRural.success) {
      setActiveTab("rural");
      toast({
        title: "Revise a ficha rural",
        description: validatedRural.error.issues[0]?.message || "Existem dados rurais inválidos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada.");

      const clientPayload = {
        ...validatedCivil.data,
        user_id: user.id,
        data_nascimento: validatedCivil.data.data_nascimento || null,
        data_expedicao: validatedCivil.data.data_expedicao || null,
      };

      if (clientPayload.capacidade_civil === "Plena") {
        clientPayload.rep_nome = "";
        clientPayload.rep_cpf = "";
        clientPayload.rep_rg = "";
        clientPayload.rep_parentesco = "";
        clientPayload.rep_endereco = "";
        clientPayload.rep_telefone = "";
      }

      let currentClientId = cliente?.id;

      if (currentClientId) {
        const { error } = await supabase.from('clients').update(clientPayload).eq('id', currentClientId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('clients').insert(clientPayload).select().single();
        if (error) throw error;
        currentClientId = data.id;
      }

      if (currentClientId) {
        const { error: interviewError } = await supabase.from('interviews').upsert({
          client_id: currentClientId,
          historico_locais: historico, 
          timeline_json: timeline,
          dados_rurais: validatedRural.data,
          updated_at: getLocalDateISO()
        }, { onConflict: 'client_id' });
        if (interviewError) throw interviewError;
      }

      toast({ title: "Sucesso!", description: "Ficha salva com sucesso.", variant: "success" });
      
      if (!cliente && currentClientId) {
        navigate(`/cliente/${currentClientId}`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao guardar.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* EFEITO VIDRO NO HEADER */}
      <header className="bg-white/90 backdrop-blur-md border-b p-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="text-slate-600"/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{cliente ? "Editar Cadastro" : "Novo Cliente"}</h1>
            <p className="text-xs text-slate-500 font-medium">Ficha Cadastral</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            <Save size={18}/> {loading ? "Salvando..." : "Salvar Tudo"}
          </button>
        </div>
      </header>

      {/* TABS COM EFEITO VIDRO (backdrop-blur) */}
      <div className="bg-white/80 backdrop-blur-md border-b px-4 flex gap-6 sticky top-[73px] z-10 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveTab('civil')} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'civil' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <User size={18}/> Dados Civis
        </button>
        <button onClick={() => setActiveTab('rural')} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'rural' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Tractor size={18}/> Ficha Rural
        </button>
        <button onClick={() => setActiveTab('anamnese')} className={`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'anamnese' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <PenTool size={18}/> Anamnese
        </button>
      </div>

      {/* RESPIRO GIGANTE NO FINAL (pb-64) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 pb-64">
        {activeTab === 'civil' && (
          <CivilDataForm
            initialData={civilData}
            onSubmit={handleCivilSubmit}
            loading={loading}
            resetVersion={formResetVersion}
          />
        )}
        
        {activeTab === 'rural' && (
          <RuralDataForm
            initialData={ruralData}
            onSave={handleRuralSave}
            loading={loading}
            resetVersion={formResetVersion}
          />
        )}

        {/* ANAMNESE INTELIGENTE (min-h-[60vh] e efeito glow) */}
        {activeTab === 'anamnese' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2 shrink-0">
              <PenTool className="text-emerald-500"/> Anamnese / Entrevista
            </h2>
            <textarea
              value={historico}
              onChange={(e) => setHistorico(e.target.value)}
              disabled={loading}
              className="w-full flex-1 p-5 border border-slate-300 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none text-base leading-relaxed bg-slate-50 focus:bg-white transition-all min-h-[60vh]"
              placeholder="Digite aqui todas as anotações, histórico do cliente e pontos importantes da entrevista..."
            />
          </div>
        )}
      </main>
    </div>
  );
}
