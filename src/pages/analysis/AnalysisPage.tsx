import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Edit2,
  FileDown,
  FileText,
  Landmark,
  Paperclip,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useBenefitAnalysis, type Periodo, type PeriodoType } from '../../hooks/useBenefitAnalysis';
import type { Client } from '../../types';
import StrategicTimeline from '../../components/StrategicTimeline';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Surface } from '../../components/ui/Surface';
import {
  compareDateOnly,
  countCoveredCalendarMonths,
  validateDateInterval,
} from '../../lib/dateIntervals';

const DOCUMENTOS_LEGAIS = [
  { nome: 'Nenhum / Não informar', fund: '' },
  ...[
    { nome: 'Autodeclaração do Segurado Especial', fund: 'Art. 38-B, § 2º, da Lei 8.213/91; Art. 115 da IN 128/2022' },
    { nome: 'Bases de Dados do Governo (InfoDAP, CAFIR, MEI, etc)', fund: 'Art. 90, §§ 5º e 6º, da IN 128/2022' },
    { nome: 'Bloco de notas do produtor rural', fund: 'Art. 106, V, da Lei 8.213/91; Art. 116, III, da IN 128/2022' },
    { nome: 'Caderneta da Capitania dos Portos ou SUDEPE', fund: 'Art. 26, V, da Portaria DIRBEN/INSS 990/2022' },
    { nome: 'Caderneta do seringueiro / Contrato SEMTA/SAVA', fund: 'Regramento Extrativista Específico (IN 128/2022)' },
    { nome: 'Carteira de vacinação e cartão da gestante', fund: 'Art. 116, XXV, da IN 128/2022' },
    { nome: 'Certidão de casamento civil ou religioso ou certidão de união estável', fund: 'Art. 116, XI, da IN 128/2022' },
    { nome: 'Certidão de nascimento ou de batismo dos filhos', fund: 'Art. 116, XII, da IN 128/2022' },
    { nome: 'Certidão de tutela ou de curatela', fund: 'Art. 116, XIII, da IN 128/2022' },
    { nome: 'Certidão fornecida pela FUNAI (para trabalhador rural indígena)', fund: 'Art. 116, X, da IN 128/2022' },
    { nome: 'Certificado de alistamento ou de quitação com o serviço militar', fund: 'Art. 116, XVI, da IN 128/2022' },
    { nome: 'Comprovante de empréstimo bancário para fins de atividade rural', fund: 'Art. 116, XXVIII, da IN 128/2022' },
    { nome: 'Comprovante de ITR, DIAC e/ou DIAT com envio à Receita Federal', fund: 'Art. 116, IX, da IN 128/2022' },
    { nome: 'Comprovante de matrícula, ficha, ata ou boletim escolar', fund: 'Art. 116, XVII, da IN 128/2022' },
    { nome: 'Comprovante de participação em programas governamentais para área rural', fund: 'Art. 116, XIX, da IN 128/2022' },
    { nome: 'Comprovante de recebimento de assistência técnica e extensão rural', fund: 'Art. 116, XX, da IN 128/2022' },
    { nome: 'Comprovantes de recolhimento de contribuição decorrentes de comercialização', fund: 'Art. 106, VIII, da Lei 8.213/91; Art. 116, VI, da IN 128/2022' },
    { nome: 'Contrato de arrendamento, parceria, meação ou comodato rural', fund: 'Art. 106, II, da Lei 8.213/91; Art. 116, I, da IN 128/2022' },
    { nome: 'Cópia da declaração de imposto de renda (IRPF) com renda rural', fund: 'Art. 106, IX, da Lei 8.213/91; Art. 116, VII, da IN 128/2022' },
    { nome: 'Declaração de Aptidão ao PRONAF (DAP) ou CAF', fund: 'Art. 106, IV, da Lei 8.213/91; Art. 116, II, da IN 128/2022' },
    { nome: 'Documentos fiscais de entrega de produção a cooperativa/entreposto', fund: 'Art. 106, VII, da Lei 8.213/91; Art. 116, V, da IN 128/2022' },
    { nome: 'Escritura pública de imóvel', fund: 'Art. 116, XXI, da IN 128/2022' },
    { nome: 'Ficha de associado em cooperativa', fund: 'Art. 116, XVIII, da IN 128/2022' },
    { nome: 'Ficha de atendimento médico ou odontológico', fund: 'Art. 116, XXXV, da IN 128/2022' },
    { nome: 'Ficha de inscrição sindical ou associativa (sindicato, colônia)', fund: 'Art. 116, XXIX, da IN 128/2022' },
    { nome: 'Ficha ou registro em hospitais ou postos de saúde', fund: 'Art. 116, XXIV, da IN 128/2022' },
    { nome: 'Licença de ocupação ou permissão outorgada pelo INCRA', fund: 'Art. 106, X, da Lei 8.213/91; Art. 116, VIII, da IN 128/2022' },
    { nome: 'Notas fiscais de entrada de mercadorias emitidas pela adquirente', fund: 'Art. 106, VI, da Lei 8.213/91; Art. 116, IV, da IN 128/2022' },
    { nome: 'Procuração', fund: 'Art. 116, XIV, da IN 128/2022' },
    { nome: 'Publicação na imprensa ou em informativos de circulação pública', fund: 'Art. 116, XXXI, da IN 128/2022' },
    { nome: 'Recibo de compra de implementos ou insumos agrícolas', fund: 'Art. 116, XXVII, da IN 128/2022' },
    { nome: 'Recibo de pagamento de contribuição federativa ou confederativa', fund: 'Art. 116, XXII, da IN 128/2022' },
    { nome: 'Recibos de contribuição social ao sindicato, colônia ou associação', fund: 'Art. 116, XXX, da IN 128/2022' },
    { nome: 'Registro em documentos de associações rurais/comunitárias', fund: 'Art. 116, XXXIII, da IN 128/2022' },
    { nome: 'Registro em livros de entidades religiosas (batismo, crisma, casamento)', fund: 'Art. 116, XXXII, da IN 128/2022' },
    { nome: 'Registro em processos judiciais (como testemunha, autor ou réu)', fund: 'Art. 116, XXIII, da IN 128/2022' },
    { nome: 'Registro Geral de Atividade Pesqueira (RGP) / SDPA', fund: 'Art. 90, § 6º, II e III, da IN 128/2022' },
    { nome: 'Título de aforamento', fund: 'Art. 116, XXXIV, da IN 128/2022' },
    { nome: 'Título de eleitor, ficha de cadastro eleitoral ou certidão eleitoral', fund: 'Art. 116, XV, da IN 128/2022' },
    { nome: 'Título de propriedade de imóvel rural', fund: 'Art. 116, XXVI, da IN 128/2022' },
  ].sort((a, b) => a.nome.localeCompare(b.nome)),
];

const EMPTY_FORM: Partial<Periodo> = {
  tipo: 'rural',
  inicio: '',
  fim: '',
  obs: '',
  linkedDocTitle: '',
  law: '',
  dataExpedicao: '',
};

const fieldClassName =
  'h-11 w-full rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 disabled:cursor-not-allowed disabled:bg-muted motion-reduce:transition-none';

interface PeriodPresentation {
  label: string;
  status: string;
  Icon: LucideIcon;
  iconClassName: string;
}

const PERIOD_PRESENTATION: Record<PeriodoType, PeriodPresentation> = {
  rural: {
    label: 'Atividade rural',
    status: 'Conta como carência rural',
    Icon: CheckCircle2,
    iconClassName: 'bg-brand-subtle text-brand',
  },
  urbano: {
    label: 'Urbano / CNIS',
    status: 'Vínculo urbano no CNIS',
    Icon: BriefcaseBusiness,
    iconClassName: 'bg-secondary text-foreground',
  },
  beneficio: {
    label: 'Benefício INSS',
    status: 'Benefício intercalado',
    Icon: Landmark,
    iconClassName: 'bg-secondary text-foreground',
  },
  lacuna: {
    label: 'Sem atividade',
    status: 'Lacuna sem atividade registrada',
    Icon: CircleDashed,
    iconClassName: 'bg-secondary text-muted-foreground',
  },
  'prova de retorno': {
    label: 'Prova de retorno',
    status: 'Documento pontual',
    Icon: Paperclip,
    iconClassName: 'bg-secondary text-foreground',
  },
};

const UNKNOWN_PERIOD_PRESENTATION: PeriodPresentation = {
  label: 'Registro legado',
  status: 'Tipo original não reconhecido; revise este período antes de salvar.',
  Icon: FileText,
  iconClassName: 'bg-neutral-subtle text-muted-foreground',
};

const getPeriodPresentation = (type: unknown) => (
  PERIOD_PRESENTATION[type as PeriodoType] ?? UNKNOWN_PERIOD_PRESENTATION
);

interface AnalysisPageProps {
  cliente: Client;
  onBack: () => void;
}

export function AnalysisPage({ cliente }: AnalysisPageProps) {
  const {
    loading,
    der,
    setDer,
    periodos,
    handleSavePeriod,
    handleRemovePeriod,
    handleSave,
  } = useBenefitAnalysis(cliente);

  const derId = useId();
  const typeId = useId();
  const startId = useId();
  const endId = useId();
  const documentDateId = useId();
  const observationId = useId();
  const documentSearchId = useId();
  const listboxId = useId();
  const optionalDocumentDateId = useId();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Periodo>>({ ...EMPTY_FORM });
  const [docSearch, setDocSearch] = useState('');
  const [showDocList, setShowDocList] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(-1);
  const listboxRef = useRef<HTMLUListElement>(null);

  let docCounter = 1;
  const periodosTratados = [...periodos]
    .sort((a, b) => compareDateOnly(a.inicio, b.inicio))
    .map((periodo) => {
      const temProva = periodo.linkedDocTitle || periodo.tipo === 'prova de retorno';
      return { ...periodo, num: temProva ? docCounter++ : null };
    });

  const filteredDocuments = useMemo(() => {
    const query = docSearch.trim().toLocaleLowerCase('pt-BR');
    if (!query) return DOCUMENTOS_LEGAIS;
    return DOCUMENTOS_LEGAIS.filter((documento) =>
      documento.nome.toLocaleLowerCase('pt-BR').includes(query),
    );
  }, [docSearch]);

  useEffect(() => {
    if (!showDocList || activeDocIndex < 0) return;
    const activeOption = listboxRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${activeDocIndex}"]`,
    );
    if (typeof activeOption?.scrollIntoView === 'function') {
      activeOption.scrollIntoView({ block: 'nearest' });
    }
  }, [activeDocIndex, listboxId, showDocList]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setDocSearch('');
    setShowDocList(false);
    setActiveDocIndex(-1);
  };

  const handleEditClick = (periodo: Periodo) => {
    setEditingId(periodo.id);
    setForm(periodo);
    setDocSearch(periodo.linkedDocTitle || '');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('form-anchor')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const selectDocument = (documento: (typeof DOCUMENTOS_LEGAIS)[number]) => {
    const isEmptyOption = documento.nome === 'Nenhum / Não informar';
    setForm((current) => ({
      ...current,
      linkedDocTitle: isEmptyOption ? '' : documento.nome,
      law: documento.fund,
    }));
    setDocSearch(isEmptyOption ? '' : documento.nome);
    setShowDocList(false);
    setActiveDocIndex(-1);
  };

  const handleDocumentKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setShowDocList(true);
      setActiveDocIndex((current) =>
        filteredDocuments.length ? Math.min(current + 1, filteredDocuments.length - 1) : -1,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setShowDocList(true);
      setActiveDocIndex((current) =>
        filteredDocuments.length ? Math.max(current - 1, 0) : -1,
      );
      return;
    }

    if (event.key === 'Enter' && showDocList && activeDocIndex >= 0) {
      event.preventDefault();
      const selectedDocument = filteredDocuments[activeDocIndex];
      if (selectedDocument) selectDocument(selectedDocument);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setShowDocList(false);
      setActiveDocIndex(-1);
    }
  };

  const onSavePeriod = () => {
    const payloadToSave = { ...form };

    if (payloadToSave.tipo === 'prova de retorno') {
      if (!payloadToSave.dataExpedicao) {
        alert('Para Provas de Retorno, a Data do Documento é obrigatória.');
        return;
      }
      payloadToSave.inicio = payloadToSave.dataExpedicao;
      payloadToSave.fim = payloadToSave.dataExpedicao;

      if (!payloadToSave.law) {
        payloadToSave.law = 'art. 116, § 2º, V, da IN 128/2022';
      }
    } else if (!payloadToSave.inicio || !payloadToSave.fim) {
      alert('Preencha o início e o fim do período.');
      return;
    }

    const validation = validateDateInterval(payloadToSave.inicio || '', payloadToSave.fim || '');
    if (!validation.valid) {
      alert(
        validation.reason === 'end-before-start'
          ? 'A data final não pode ser anterior à data inicial.'
          : 'Informe datas válidas para o início e o fim do período.',
      );
      return;
    }

    try {
      const saved = handleSavePeriod(payloadToSave, editingId);
      if (saved) resetForm();
    } catch (error) {
      console.error('Erro ao salvar período:', error);
      alert('Houve um erro ao registrar. Verifique os dados.');
    }
  };

  const fmtDate = (date: string) => {
    if (!date) return '';
    const parts = date.split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${cliente.nome} - Linha do Tempo Rural`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const isProvaDeRetorno = form.tipo === 'prova de retorno';

  return (
    <div className="flex h-full flex-col bg-background print:block print:h-auto">
      <style type="text/css" media="print">
        {`
          @page { size: portrait; margin: 15mm; }
          html, body, #root { height: auto !important; overflow: visible !important; }
          .h-screen, .h-full, .overflow-hidden, .overflow-y-auto, .overflow-auto {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
        `}
      </style>

      <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-4 backdrop-blur-xl sm:px-6 print:hidden">
        <div className="mx-auto flex max-w-content items-start gap-3">
          <PageHeader
            className="min-w-0 flex-1"
            headingLevel={2}
            title="Análise estratégica"
            description={`Organize períodos e provas de ${cliente.nome} antes de consolidar o cálculo.`}
            leading={<Calculator aria-hidden="true" size={20} />}
            actions={
              <>
                <Button variant="outline" onClick={handlePrint}>
                  <FileDown aria-hidden="true" size={17} />
                  Exportar PDF
                </Button>
                <Button onClick={() => void handleSave()} disabled={loading}>
                  <Save aria-hidden="true" size={17} />
                  {loading ? 'Salvando…' : 'Salvar análise'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto print:block print:h-auto print:overflow-visible">
        <div className="mx-auto max-w-content space-y-8 px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:p-0">
          <section className="print:hidden" aria-labelledby="analysis-reference-title">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="analysis-reference-title" className="text-base font-semibold tracking-[-0.01em] text-foreground">
                  Referência do cálculo
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A DER define o ponto final sugerido para a régua de carência.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <label htmlFor={derId} className="mb-1.5 block text-sm font-medium text-foreground">
                  Data do requerimento (DER)
                </label>
                <input
                  id={derId}
                  type="date"
                  value={der}
                  onChange={(event) => setDer(event.target.value)}
                  className={`${fieldClassName} text-tabular`}
                />
              </div>
            </div>
          </section>

          <StrategicTimeline der={der} periodos={periodosTratados} clienteNome={cliente.nome} />

          <Surface id="form-anchor" className="scroll-mt-28 print:hidden" padding="lg">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSavePeriod();
              }}
            >
              <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {editingId ? <Edit2 aria-hidden="true" size={18} /> : <Plus aria-hidden="true" size={18} />}
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                      {editingId ? 'Editar registro' : 'Adicionar registro'}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Registre atividade, lacunas, benefícios ou uma prova documental pontual.
                  </p>
                </div>
                {editingId ? (
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    <X aria-hidden="true" size={17} />
                    Cancelar edição
                  </Button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
                <div className="md:col-span-4">
                  <label htmlFor={typeId} className="mb-1.5 block text-sm font-medium text-foreground">
                    Tipo de registro
                  </label>
                  <select
                    id={typeId}
                    value={form.tipo}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, tipo: event.target.value as PeriodoType }))
                    }
                    className={fieldClassName}
                  >
                    <option value="rural">Atividade rural</option>
                    <option value="urbano">Urbano / CNIS</option>
                    <option value="beneficio">Benefício INSS</option>
                    <option value="lacuna">Sem atividade</option>
                    <option value="prova de retorno">Prova de retorno</option>
                  </select>
                </div>

                {!isProvaDeRetorno ? (
                  <>
                    <div className="md:col-span-4">
                      <label htmlFor={startId} className="mb-1.5 block text-sm font-medium text-foreground">
                        Data inicial
                      </label>
                      <input
                        id={startId}
                        type="date"
                        required
                        value={form.inicio || ''}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, inicio: event.target.value }))
                        }
                        className={`${fieldClassName} text-tabular`}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label htmlFor={endId} className="mb-1.5 block text-sm font-medium text-foreground">
                        Data final
                      </label>
                      <input
                        id={endId}
                        type="date"
                        required
                        value={form.fim || ''}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, fim: event.target.value }))
                        }
                        className={`${fieldClassName} text-tabular`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-4">
                    <label htmlFor={documentDateId} className="mb-1.5 block text-sm font-medium text-foreground">
                      Data do documento
                    </label>
                    <input
                      id={documentDateId}
                      type="date"
                      required
                      value={form.dataExpedicao || ''}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, dataExpedicao: event.target.value }))
                      }
                      className={`${fieldClassName} text-tabular`}
                    />
                  </div>
                )}

                <div className={isProvaDeRetorno ? 'md:col-span-4' : 'md:col-span-12'}>
                  <label htmlFor={observationId} className="mb-1.5 block text-sm font-medium text-foreground">
                    Observação ou referência
                  </label>
                  <input
                    id={observationId}
                    type="text"
                    placeholder="Ex.: Sítio São Judas, safra de café"
                    value={form.obs || ''}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, obs: event.target.value }))
                    }
                    className={fieldClassName}
                  />
                </div>

                <div className="relative md:col-span-7">
                  <label htmlFor={documentSearchId} className="mb-1.5 block text-sm font-medium text-foreground">
                    Documento e fundamento legal
                  </label>
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id={documentSearchId}
                      type="text"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={showDocList}
                      aria-controls={listboxId}
                      aria-activedescendant={
                        showDocList && activeDocIndex >= 0 && activeDocIndex < filteredDocuments.length
                          ? `${listboxId}-option-${activeDocIndex}`
                          : undefined
                      }
                      autoComplete="off"
                      placeholder="Pesquisar documento"
                      value={docSearch}
                      onChange={(event) => {
                        setDocSearch(event.target.value);
                        setShowDocList(true);
                        setActiveDocIndex(-1);
                      }}
                      onFocus={() => {
                        setShowDocList(true);
                        setActiveDocIndex((current) => (
                          current < 0 && filteredDocuments.length > 0 ? 0 : current
                        ));
                      }}
                      onBlur={() => window.setTimeout(() => setShowDocList(false), 150)}
                      onKeyDown={handleDocumentKeyDown}
                      className={`${fieldClassName} pl-10`}
                    />
                  </div>

                  {showDocList ? (
                    <ul
                      ref={listboxRef}
                      id={listboxId}
                      role="listbox"
                      aria-label="Documentos legais"
                      className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-surface border border-border bg-popover p-1.5 shadow-floating"
                    >
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((documento, index) => (
                          <li key={documento.nome} role="presentation">
                            <button
                              id={`${listboxId}-option-${index}`}
                              data-option-index={index}
                              type="button"
                              role="option"
                              aria-selected={activeDocIndex === index}
                              tabIndex={-1}
                              onMouseDown={(event) => event.preventDefault()}
                              onMouseEnter={() => setActiveDocIndex(index)}
                              onClick={() => selectDocument(documento)}
                              className={`min-h-11 w-full rounded-control px-3 py-2 text-left outline-none transition-colors motion-reduce:transition-none ${
                                activeDocIndex === index ? 'bg-accent' : 'hover:bg-accent'
                              }`}
                            >
                              <span className="block text-sm font-medium text-popover-foreground">{documento.nome}</span>
                              {documento.fund ? (
                                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{documento.fund}</span>
                              ) : null}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-4 text-sm text-muted-foreground">Nenhum documento encontrado.</li>
                      )}
                    </ul>
                  ) : null}
                </div>

                {!isProvaDeRetorno ? (
                  <div className="md:col-span-3">
                    <label htmlFor={optionalDocumentDateId} className="mb-1.5 block text-sm font-medium text-foreground">
                      Data do documento <span className="font-normal text-muted-foreground">(opcional)</span>
                    </label>
                    <input
                      id={optionalDocumentDateId}
                      type="date"
                      value={form.dataExpedicao || ''}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, dataExpedicao: event.target.value }))
                      }
                      className={`${fieldClassName} text-tabular`}
                    />
                  </div>
                ) : null}

                <div className={`${isProvaDeRetorno ? 'md:col-span-5' : 'md:col-span-2'} flex items-end`}>
                  <Button type="submit" className="w-full">
                    {editingId ? <Save aria-hidden="true" size={17} /> : <Plus aria-hidden="true" size={17} />}
                    {editingId ? 'Salvar edição' : 'Inserir'}
                  </Button>
                </div>
              </div>
            </form>
          </Surface>

          <section className="print:hidden" aria-labelledby="registered-periods-title">
            <div className="mb-4">
              <h2 id="registered-periods-title" className="text-lg font-semibold tracking-[-0.02em] text-foreground">
                Registros da análise
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {periodosTratados.length === 1
                  ? '1 registro organizado cronologicamente.'
                  : `${periodosTratados.length} registros organizados cronologicamente.`}
              </p>
            </div>

            <Surface variant="outlined" padding="none" className="overflow-hidden">
              {periodosTratados.length > 0 ? (
                <ol className="divide-y divide-border">
                  {periodosTratados.map((periodo) => {
                    const meses = countCoveredCalendarMonths(periodo.inicio, periodo.fim);
                    const presentation = getPeriodPresentation(periodo.tipo);
                    const PeriodIcon = presentation.Icon;

                    return (
                      <li key={periodo.id} className="p-4 sm:p-5">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              periodo.num ? 'bg-foreground text-background' : presentation.iconClassName
                            }`}
                            aria-hidden="true"
                          >
                            {periodo.num ? <span className="text-sm font-semibold">{periodo.num}</span> : <PeriodIcon size={17} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                              <h3 className="font-semibold text-foreground">{presentation.label}</h3>
                              {periodo.tipo !== 'prova de retorno' && meses > 0 ? (
                                <span className="text-xs font-medium text-muted-foreground text-tabular">
                                  {meses} {meses === 1 ? 'mês coberto' : 'meses cobertos'}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 text-sm text-foreground text-tabular">
                              {periodo.tipo === 'prova de retorno'
                                ? `Documento de ${fmtDate(periodo.dataExpedicao || periodo.inicio)}`
                                : `${fmtDate(periodo.inicio)}${periodo.fim ? ` a ${fmtDate(periodo.fim)}` : ''}`}
                            </p>
                            <p className="mt-1 text-xs font-medium text-muted-foreground">{presentation.status}</p>

                            {periodo.obs ? <p className="mt-3 text-sm leading-6 text-foreground">{periodo.obs}</p> : null}

                            {periodo.linkedDocTitle || periodo.tipo === 'prova de retorno' ? (
                              <div className="mt-4 border-l-2 border-info/35 pl-3">
                                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                  <FileText aria-hidden="true" size={15} className="text-info-foreground" />
                                  {periodo.tipo === 'prova de retorno' ? 'Prova de retorno' : periodo.linkedDocTitle}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                  {periodo.tipo === 'prova de retorno' && !periodo.law
                                    ? 'art. 116, § 2º, V, da IN 128/2022'
                                    : periodo.law}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(periodo)}
                              aria-label={`Editar ${presentation.label.toLowerCase()}`}
                            >
                              <Edit2 aria-hidden="true" size={17} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePeriod(periodo.id)}
                              aria-label={`Remover ${presentation.label.toLowerCase()}`}
                              className="text-muted-foreground hover:bg-danger-subtle hover:text-danger-foreground"
                            >
                              <Trash2 aria-hidden="true" size={17} />
                            </Button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="flex flex-col items-center px-6 py-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-subtle text-muted-foreground">
                    <Clock3 aria-hidden="true" size={19} />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">Nenhum registro adicionado</h3>
                  <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                    Use o formulário acima para começar a montar a análise cronológica.
                  </p>
                </div>
              )}
            </Surface>
          </section>
        </div>
      </div>
    </div>
  );
}
