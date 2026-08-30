import { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, Circle, LoaderCircle, Save, User, PenTool, Tractor
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

const UNSAVED_CHANGES_MESSAGE = 'Existem alterações não salvas. Deseja sair e descartá-las?';

export function ClientFormPage({ cliente, onBack }: ClientFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveActivity, setSaveActivity] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [civilDirty, setCivilDirty] = useState(false);
  const [ruralDirty, setRuralDirty] = useState(false);
  const [historyDirty, setHistoryDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'civil' | 'rural' | 'anamnese'>('civil');
  
  const [civilData, setCivilData] = useState<Partial<CivilFormValues>>({});
  const [ruralData, setRuralData] = useState<Partial<RuralFormValues>>({});
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [historico, setHistorico] = useState(""); 
  const [timeline, setTimeline] = useState<Period[]>([]);
  const clientId = cliente?.id;
  const isExistingClient = Boolean(clientId);
  const isInterviewRoute = location.pathname.endsWith('/entrevista');
  const loading = loadingData || saving;
  const hasUnsavedChanges = civilDirty || ruralDirty || historyDirty;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) return;

      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const isSameLocation = destination.origin === current.origin
        && destination.pathname === current.pathname
        && destination.search === current.search
        && destination.hash === current.hash;

      if (destination.origin !== current.origin || isSameLocation) return;
      if (window.confirm(UNSAVED_CHANGES_MESSAGE)) return;

      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm(UNSAVED_CHANGES_MESSAGE)) return;
    onBack();
  }, [hasUnsavedChanges, onBack]);

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

    setLoadingData(true);
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
      setCivilDirty(false);
      setRuralDirty(false);
      setHistoryDirty(false);
      setSaveActivity('idle');
    } catch (error) {
      console.error("Erro:", error);
      toast({ variant: "destructive", title: "Erro", description: "Falha ao carregar dados." });
    } finally {
      setLoadingData(false);
    }
  }, [clientId, toast]);

  useEffect(() => {
    if (clientId) void loadFullData();
  }, [clientId, loadFullData]);

  const handleCivilSubmit = useCallback((data: CivilFormValues) => {
    setCivilData(data);
  }, []);

  const handleRuralSave = useCallback((data: RuralFormValues) => {
    setRuralData(data);
  }, []);

  const handleCivilDirtyChange = useCallback((isDirty: boolean) => {
    setCivilDirty(isDirty);
    if (isDirty) setSaveActivity('idle');
  }, []);

  const handleRuralDirtyChange = useCallback((isDirty: boolean) => {
    setRuralDirty(isDirty);
    if (isDirty) setSaveActivity('idle');
  }, []);

  const focusInvalidField = useCallback((fieldName?: string) => {
    if (!fieldName) return;

    window.setTimeout(() => {
      document.querySelector<HTMLElement>(`[name="${fieldName}"]`)?.focus();
    }, 0);
  }, []);

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

      setActiveTab('civil');
      focusInvalidField(String(validatedCivil.error.issues[0]?.path[0] || ''));
      toast({
        title: "Revise os dados civis",
        description: `Campos inválidos ou ausentes: ${invalidFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    const validatedRural = ruralSchema.safeParse(ruralData);
    if (!validatedRural.success) {
      setActiveTab('rural');
      focusInvalidField(String(validatedRural.error.issues[0]?.path[0] || ''));
      toast({
        title: "Revise a ficha rural",
        description: validatedRural.error.issues[0]?.message || "Existem dados rurais inválidos.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    setSaveActivity('saving');
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
      setCivilDirty(false);
      setRuralDirty(false);
      setHistoryDirty(false);
      setSaveActivity('saved');
      setFormResetVersion((version) => version + 1);
      
      if (!cliente && currentClientId) {
        navigate(`/cliente/${currentClientId}`);
      } else if (cliente && currentClientId) {
        const target = activeTab === 'civil'
          ? `/cliente/${currentClientId}/cadastro`
          : activeTab === 'anamnese'
            ? `/cliente/${currentClientId}/entrevista?secao=historico`
            : `/cliente/${currentClientId}/entrevista`;
        const current = location.pathname + location.search;
        if (current !== target) navigate(target, { replace: true });
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao guardar.";
      setSaveActivity('error');
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background font-sans">
      <header className="shrink-0 border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {!isExistingClient ? (
              <button
                type="button"
                onClick={handleBack}
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

          <div className="flex flex-wrap items-center justify-end gap-3">
            {saveActivity !== 'saving' && (hasUnsavedChanges || saveActivity === 'saved' || saveActivity === 'error') ? (
              <div
                aria-live="polite"
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  saveActivity === 'error'
                    ? 'text-danger'
                    : hasUnsavedChanges
                      ? 'text-muted-foreground'
                      : 'text-success-foreground'
                }`}
              >
                {hasUnsavedChanges ? (
                  <Circle size={10} fill="currentColor" aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={14} aria-hidden="true" />
                )}
                {saveActivity === 'error'
                  ? 'Não foi possível salvar'
                  : hasUnsavedChanges
                    ? 'Alterações não salvas'
                    : 'Alterações salvas'}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              aria-busy={saveActivity === 'saving'}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-150 ease-product hover:bg-primary-hover hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px active:shadow-none motion-reduce:transform-none disabled:cursor-wait disabled:translate-y-0 disabled:opacity-60"
            >
              {saveActivity === 'saving' ? (
                <LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Save size={17} aria-hidden="true" />
              )}
              {saveActivity === 'saving' ? 'Salvando…' : loadingData ? 'Carregando…' : 'Salvar cliente'}
            </button>
          </div>
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
                className={`inline-flex min-h-11 items-center gap-2 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
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
              className={`min-h-11 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${activeTab === 'rural' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dados da atividade
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'anamnese'}
              onClick={() => handleTabChange('anamnese')}
              className={`min-h-11 rounded-[0.6rem] px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-150 ease-product focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${activeTab === 'anamnese' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
            onDirtyChange={handleCivilDirtyChange}
            loading={loading}
            resetVersion={formResetVersion}
          />
        )}
        
        {activeTab === 'rural' && (
          <RuralDataForm
            initialData={ruralData}
            onSave={handleRuralSave}
            onDirtyChange={handleRuralDirtyChange}
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
                  onChange={(e) => {
                    setHistorico(e.target.value);
                    setHistoryDirty(true);
                    setSaveActivity('idle');
                  }}
                  disabled={loading}
                  rows={16}
                  className="min-h-80 w-full resize-y rounded-control border border-input bg-surface-subtle/55 p-4 text-sm leading-6 text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-product placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 disabled:cursor-wait disabled:bg-muted"
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
