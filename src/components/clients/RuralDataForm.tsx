import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound,
  MapPinned,
  Sprout,
  Store,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { z } from "zod";
import { ruralSchema } from "../../schemas/clientSchemas";
import { maskCPF } from "../../lib/utils";

type RuralFormValues = z.infer<typeof ruralSchema>;

interface RuralDataFormProps {
  initialData?: Partial<RuralFormValues>;
  onSave: (data: RuralFormValues) => void;
  loading?: boolean;
  resetVersion?: number;
}

const labelClassName = "mb-1.5 block text-sm font-medium text-foreground";
const controlClassName = "min-h-11 w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";
const textareaClassName = `${controlClassName} resize-y`;

interface SectionHeaderProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

function SectionHeader({ id, title, description, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-4 sm:px-5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Icon aria-hidden="true" size={18} />
      </span>
      <div>
        <h3 id={id} className="text-base font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

interface FieldErrorProps {
  id: string;
  message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-destructive">
      {message}
    </p>
  );
}

export function RuralDataForm({
  initialData,
  onSave,
  loading,
  resetVersion = 0,
}: RuralDataFormProps) {
  const initialDataRef = useRef(initialData);

  const {
    control,
    register,
    reset,
    subscribe,
    formState: { errors },
  } = useForm<RuralFormValues>({
    resolver: zodResolver(ruralSchema),
    mode: "onChange",
    defaultValues: {
      nome_imovel: initialData?.nome_imovel || "",
      municipio_uf: initialData?.municipio_uf || "",
      itr_nirf: initialData?.itr_nirf || "",
      area_total: initialData?.area_total || "",
      area_util: initialData?.area_util || "",
      condicao_posse: initialData?.condicao_posse || "proprietario",
      outorgante_nome: initialData?.outorgante_nome || "",
      outorgante_cpf: initialData?.outorgante_cpf || "",
      culturas: initialData?.culturas || "",
      animais: initialData?.animais || "",
      destinacao: initialData?.destinacao || "",
      locais_venda: initialData?.locais_venda || "",
      tem_empregados: initialData?.tem_empregados || "nao",
      tempo_empregados: initialData?.tempo_empregados || "",
      grupo_familiar: initialData?.grupo_familiar || "",
    },
  });

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    const nextInitialData = initialDataRef.current;

    reset({
      nome_imovel: nextInitialData?.nome_imovel || "",
      municipio_uf: nextInitialData?.municipio_uf || "",
      itr_nirf: nextInitialData?.itr_nirf || "",
      area_total: nextInitialData?.area_total || "",
      area_util: nextInitialData?.area_util || "",
      condicao_posse: nextInitialData?.condicao_posse || "proprietario",
      outorgante_nome: nextInitialData?.outorgante_nome || "",
      outorgante_cpf: nextInitialData?.outorgante_cpf || "",
      culturas: nextInitialData?.culturas || "",
      animais: nextInitialData?.animais || "",
      destinacao: nextInitialData?.destinacao || "",
      locais_venda: nextInitialData?.locais_venda || "",
      tem_empregados: nextInitialData?.tem_empregados || "nao",
      tempo_empregados: nextInitialData?.tempo_empregados || "",
      grupo_familiar: nextInitialData?.grupo_familiar || "",
    });
  }, [reset, resetVersion]);

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onSave(values),
    });
  }, [subscribe, onSave]);

  const condicaoPosse = useWatch({ control, name: "condicao_posse" });
  const temEmpregados = useWatch({ control, name: "tem_empregados" });
  const showOutorgante = (condicaoPosse || "proprietario") !== "proprietario";
  const showTempoEmpregados = temEmpregados === "sim";

  const handleCpfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = maskCPF(event.target.value);
  };

  return (
    <fieldset
      disabled={loading}
      aria-busy={loading}
      className="space-y-5 disabled:opacity-70"
    >
      <legend className="sr-only">Ficha de atividade rural</legend>

      <section aria-labelledby="rural-section-imovel" className="rounded-lg border border-border bg-card">
        <SectionHeader
          id="rural-section-imovel"
          title="Imóvel"
          description="Identificação, localização e dimensões da área rural."
          icon={MapPinned}
        />
        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2">
          <div>
            <label htmlFor="rural-nome-imovel" className={labelClassName}>
              Nome do imóvel
            </label>
            <input
              id="rural-nome-imovel"
              {...register("nome_imovel")}
              aria-invalid={Boolean(errors.nome_imovel)}
              aria-describedby={errors.nome_imovel ? "rural-nome-imovel-error" : undefined}
              className={controlClassName}
              placeholder="Ex.: Sítio Boa Esperança"
            />
            <FieldError id="rural-nome-imovel-error" message={errors.nome_imovel?.message} />
          </div>

          <div>
            <label htmlFor="rural-municipio-uf" className={labelClassName}>
              Município e UF
            </label>
            <input
              id="rural-municipio-uf"
              {...register("municipio_uf")}
              aria-invalid={Boolean(errors.municipio_uf)}
              aria-describedby={errors.municipio_uf ? "rural-municipio-uf-error" : undefined}
              className={controlClassName}
              placeholder="Ex.: Anagé — BA"
            />
            <FieldError id="rural-municipio-uf-error" message={errors.municipio_uf?.message} />
          </div>

          <div>
            <label htmlFor="rural-itr-nirf" className={labelClassName}>
              ITR, NIRF ou CCIR
            </label>
            <input
              id="rural-itr-nirf"
              {...register("itr_nirf")}
              aria-invalid={Boolean(errors.itr_nirf)}
              aria-describedby={errors.itr_nirf ? "rural-itr-nirf-error" : undefined}
              className={controlClassName}
              placeholder="Informe o número disponível"
            />
            <FieldError id="rural-itr-nirf-error" message={errors.itr_nirf?.message} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="rural-area-total" className={labelClassName}>
                Área total (ha)
              </label>
              <input
                id="rural-area-total"
                {...register("area_total")}
                inputMode="decimal"
                aria-invalid={Boolean(errors.area_total)}
                aria-describedby={errors.area_total ? "rural-area-total-error" : undefined}
                className={controlClassName}
                placeholder="0,00"
              />
              <FieldError id="rural-area-total-error" message={errors.area_total?.message} />
            </div>

            <div>
              <label htmlFor="rural-area-util" className={labelClassName}>
                Área utilizada (ha)
              </label>
              <input
                id="rural-area-util"
                {...register("area_util")}
                inputMode="decimal"
                aria-invalid={Boolean(errors.area_util)}
                aria-describedby={errors.area_util ? "rural-area-util-error" : undefined}
                className={controlClassName}
                placeholder="0,00"
              />
              <FieldError id="rural-area-util-error" message={errors.area_util?.message} />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="rural-section-posse" className="rounded-lg border border-border bg-card">
        <SectionHeader
          id="rural-section-posse"
          title="Posse"
          description="Condição de exploração da terra e identificação do proprietário, quando aplicável."
          icon={KeyRound}
        />
        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2">
          <div className="md:col-span-2 md:max-w-sm">
            <label htmlFor="rural-condicao-posse" className={labelClassName}>
              Condição de posse
            </label>
            <select
              id="rural-condicao-posse"
              {...register("condicao_posse")}
              aria-invalid={Boolean(errors.condicao_posse)}
              aria-describedby={errors.condicao_posse ? "rural-condicao-posse-error" : undefined}
              className={controlClassName}
            >
              <option value="proprietario">Proprietário</option>
              <option value="posseiro">Posseiro</option>
              <option value="arrendatario">Arrendatário</option>
              <option value="parceiro">Parceiro ou meeiro</option>
              <option value="comodatario">Comodatário</option>
              <option value="assentado">Assentado</option>
            </select>
            <FieldError id="rural-condicao-posse-error" message={errors.condicao_posse?.message} />
          </div>

          {showOutorgante && (
            <>
              <div>
                <label htmlFor="rural-outorgante-nome" className={labelClassName}>
                  Nome do proprietário ou outorgante
                </label>
                <input
                  id="rural-outorgante-nome"
                  {...register("outorgante_nome")}
                  aria-invalid={Boolean(errors.outorgante_nome)}
                  aria-describedby={errors.outorgante_nome ? "rural-outorgante-nome-error" : undefined}
                  className={controlClassName}
                  placeholder="Nome completo"
                />
                <FieldError id="rural-outorgante-nome-error" message={errors.outorgante_nome?.message} />
              </div>

              <div>
                <label htmlFor="rural-outorgante-cpf" className={labelClassName}>
                  CPF do proprietário ou outorgante
                </label>
                <input
                  id="rural-outorgante-cpf"
                  {...register("outorgante_cpf", { onChange: handleCpfChange })}
                  inputMode="numeric"
                  maxLength={14}
                  aria-invalid={Boolean(errors.outorgante_cpf)}
                  aria-describedby={errors.outorgante_cpf ? "rural-outorgante-cpf-error" : undefined}
                  className={controlClassName}
                  placeholder="000.000.000-00"
                />
                <FieldError id="rural-outorgante-cpf-error" message={errors.outorgante_cpf?.message} />
              </div>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="rural-section-producao" className="rounded-lg border border-border bg-card">
        <SectionHeader
          id="rural-section-producao"
          title="Produção"
          description="Atividades agrícolas, criações e destinação da produção."
          icon={Sprout}
        />
        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2">
          <div>
            <label htmlFor="rural-culturas" className={labelClassName}>
              Culturas e atividades agrícolas
            </label>
            <textarea
              id="rural-culturas"
              {...register("culturas")}
              rows={3}
              aria-invalid={Boolean(errors.culturas)}
              aria-describedby={errors.culturas ? "rural-culturas-error" : undefined}
              className={textareaClassName}
              placeholder="Descreva o que planta ou produz"
            />
            <FieldError id="rural-culturas-error" message={errors.culturas?.message} />
          </div>

          <div>
            <label htmlFor="rural-animais" className={labelClassName}>
              Criações e animais
            </label>
            <textarea
              id="rural-animais"
              {...register("animais")}
              rows={3}
              aria-invalid={Boolean(errors.animais)}
              aria-describedby={errors.animais ? "rural-animais-error" : undefined}
              className={textareaClassName}
              placeholder="Informe espécies e finalidade da criação"
            />
            <FieldError id="rural-animais-error" message={errors.animais?.message} />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="rural-destinacao" className={labelClassName}>
              Destinação da produção
            </label>
            <textarea
              id="rural-destinacao"
              {...register("destinacao")}
              rows={2}
              aria-invalid={Boolean(errors.destinacao)}
              aria-describedby={errors.destinacao ? "rural-destinacao-error" : undefined}
              className={textareaClassName}
              placeholder="Ex.: consumo familiar, venda do excedente ou comercialização integral"
            />
            <FieldError id="rural-destinacao-error" message={errors.destinacao?.message} />
          </div>
        </div>
      </section>

      <section aria-labelledby="rural-section-comercializacao" className="rounded-lg border border-border bg-card">
        <SectionHeader
          id="rural-section-comercializacao"
          title="Comercialização"
          description="Canais e locais usados para vender a produção rural."
          icon={Store}
        />
        <div className="p-4 sm:p-5">
          <label htmlFor="rural-locais-venda" className={labelClassName}>
            Locais e formas de venda
          </label>
          <textarea
            id="rural-locais-venda"
            {...register("locais_venda")}
            rows={2}
            aria-invalid={Boolean(errors.locais_venda)}
            aria-describedby={errors.locais_venda ? "rural-locais-venda-error" : undefined}
            className={textareaClassName}
            placeholder="Ex.: feira livre, cooperativa, atravessador ou venda direta"
          />
          <FieldError id="rural-locais-venda-error" message={errors.locais_venda?.message} />
        </div>
      </section>

      <section aria-labelledby="rural-section-grupo" className="rounded-lg border border-border bg-card">
        <SectionHeader
          id="rural-section-grupo"
          title="Grupo familiar"
          description="Participação da família e eventual contratação de empregados."
          icon={UsersRound}
        />
        <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2">
          <div className={showTempoEmpregados ? "" : "md:col-span-2 md:max-w-sm"}>
            <label htmlFor="rural-tem-empregados" className={labelClassName}>
              Possui empregados?
            </label>
            <select
              id="rural-tem-empregados"
              {...register("tem_empregados")}
              aria-invalid={Boolean(errors.tem_empregados)}
              aria-describedby={errors.tem_empregados ? "rural-tem-empregados-error" : undefined}
              className={controlClassName}
            >
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
            <FieldError id="rural-tem-empregados-error" message={errors.tem_empregados?.message} />
          </div>

          {showTempoEmpregados && (
            <div>
              <label htmlFor="rural-tempo-empregados" className={labelClassName}>
                Período e frequência da contratação
              </label>
              <input
                id="rural-tempo-empregados"
                {...register("tempo_empregados")}
                aria-invalid={Boolean(errors.tempo_empregados)}
                aria-describedby={errors.tempo_empregados ? "rural-tempo-empregados-error" : undefined}
                className={controlClassName}
                placeholder="Ex.: dois meses por safra"
              />
              <FieldError id="rural-tempo-empregados-error" message={errors.tempo_empregados?.message} />
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="rural-grupo-familiar" className={labelClassName}>
              Composição e participação do grupo familiar
            </label>
            <textarea
              id="rural-grupo-familiar"
              {...register("grupo_familiar")}
              rows={3}
              aria-invalid={Boolean(errors.grupo_familiar)}
              aria-describedby={errors.grupo_familiar ? "rural-grupo-familiar-error" : undefined}
              className={textareaClassName}
              placeholder="Informe quem participa da atividade e como cada pessoa contribui"
            />
            <FieldError id="rural-grupo-familiar-error" message={errors.grupo_familiar?.message} />
          </div>
        </div>
      </section>
    </fieldset>
  );
}
