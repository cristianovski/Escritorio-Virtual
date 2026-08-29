import { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'civil' | 'rural' | 'anamnese'>('civil');
  
  const [civilData, setCivilData] = useState<Partial<CivilFormValues>>({});
  const [ruralData, setRuralData] = useState<Partial<RuralFormValues>>({});
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [historico, setHistorico] = useState(""); 
  const [timeline, setTimeline] = useState<Period[]>([]);
  const clientId = cliente?.id;
  const isExistingClient = Boolean(clientId);
  const isInterviewRoute = location.pathname.endsWith('/entrevista');

  useEffect(() => {
    if (!isExistingClient) return;

    if (isInterviewRoute) {
      const section = new URLSearchParams(location.search).get('secao');
      setActiveTab(section === 'historico' ? 'anamnese' : 'rural');
      return;
    }

    setActiveTab('civil');
  }, [isExistingClient, isInterviewRoute, location.search]);

  const handleTabChange = (tab: 'civil' | 'rural' | 'anamnese') => {
    setActiveTab(tab);

    if (!clientId) return;
    if (tab === 'civil') {
      navigate(`/cliente/${clientId}/cadastro`);
      return;
    }

    navigate(
      tab === 'anamnese'
        ? `/cliente/${clientId}/entrevista?secao=historico`
        : `/cliente/${clientId}/entrevista`,
    );
  };

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

      handleTabChange("civil");
      toast({
        title: "Revise os dados civis",
        description: `Campos inválidos ou ausentes: ${invalidFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    const validatedRural = ruralSchema.safeParse(ruralData);
    if (!validatedRural.success) {
      handleTabChange("rural");
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
    <div className="flex h-full min-h-0 flex-col bg-background font-sans">
      <header className="shrink-0 bg-background px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {!isExistingClient ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Voltar para clientes"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
            ) : null}
            <div className="min-w-0">
              {!isExistingClient ? (
                <>
                  <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Novo cliente</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Cadastre as informações do novo atendimento.</p>
                </>
              ) : (
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                  {activeTab === 'civil' ? 'Cadastro' : activeTab === 'rural' ? 'Entrevista rural' : 'Histórico do caso'}
                </h2>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary-hover hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <Save size={17} aria-hidden="true" />
            {loading ? 'Salvando…' : 'Salvar cliente'}
          </button>
        </div>
      </header>

      {!isExistingClient ? (
        <nav className="shrink-0 overflow-x-auto bg-background px-4 pb-4 sm:px-6" aria-label="Etapas do cadastro">
          <div className="mx-auto flex min-w-max max-w-6xl gap-1 rounded-control bg-secondary p-1" aria-label="Seções do novo cliente">
            {[
              { id: 'civil' as const, label: 'Cadastro', icon: User },
              { id: 'rural' as const, label: 'Entrevista rural', icon: Tractor },
              { id: 'anamnese' as const, label: 'Histórico do caso', icon: PenTool },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={17} aria-hidden="true" /> {tab.label}
              </button>
            ))}
          </div>
        </nav>
      ) : isInterviewRoute ? (
        <nav className="shrink-0 bg-background px-4 pb-4 sm:px-6" aria-label="Seções da entrevista rural">
          <div className="mx-auto flex max-w-6xl gap-1 rounded-control bg-secondary p-1" aria-label="Conteúdo da entrevista rural">
            <button
              type="button"
              aria-pressed={activeTab === 'rural'}
              onClick={() => handleTabChange('rural')}
              className={`min-h-11 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === 'rural' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dados da atividade
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'anamnese'}
              onClick={() => handleTabChange('anamnese')}
              className={`min-h-11 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeTab === 'anamnese' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Histórico do caso
            </button>
          </div>
        </nav>
      ) : null}

      <div className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-4 pb-8 sm:px-6 lg:px-8">
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

        {activeTab === 'anamnese' && (
          <section className="rounded-surface bg-card p-5 shadow-panel ring-1 ring-border/80 sm:p-6">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <PenTool className="text-brand" size={19} aria-hidden="true" /> Histórico do caso
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Registre o relato em texto livre. Use o roteiro abaixo para manter as entrevistas consistentes.
              </p>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="rounded-control bg-secondary p-4">
                <p className="text-sm font-semibold text-foreground">Roteiro sugerido</p>
                <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
                  <li>• Locais e períodos de atividade rural</li>
                  <li>• Composição e trabalho do grupo familiar</li>
                  <li>• Culturas, criações e comercialização</li>
                  <li>• Mudanças, vínculos urbanos e divergências</li>
                  <li>• Provas mencionadas durante a entrevista</li>
                </ul>
              </aside>
              <div>
                <label htmlFor="historico-caso" className="mb-2 block text-sm font-medium text-foreground">
                  Relato da entrevista
                </label>
                <textarea
                  id="historico-caso"
                  value={historico}
                  onChange={(e) => setHistorico(e.target.value)}
                  disabled={loading}
                  rows={16}
                  className="min-h-80 w-full resize-y rounded-control border border-input bg-surface-subtle/55 p-4 text-sm leading-6 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 disabled:cursor-wait disabled:bg-muted"
                  placeholder="Descreva o histórico rural, a rotina de trabalho, os períodos e as provas citadas pelo cliente…"
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
