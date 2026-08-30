import { useEffect, useId, useRef, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  PenTool,
  Shield,
} from "lucide-react";
import { civilSchema, CivilFormValues } from "../../schemas/clientSchemas";
import { cn, maskCPF, maskPhone, maskCEP } from "../../lib/utils";
import { Surface } from "../ui/Surface";

interface CivilDataFormProps {
  initialData?: Partial<CivilFormValues>;
  onSubmit: (data: CivilFormValues) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  loading?: boolean;
  resetVersion?: number;
}

interface FieldProps {
  id: string;
  label: ReactNode;
  children: ReactNode;
  className?: string;
  error?: string;
  required?: boolean;
}

const controlClassName =
  "block h-11 w-full rounded-control border border-input bg-surface-subtle/55 px-3 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-product placeholder:text-muted-foreground/70 aria-[invalid=true]:border-danger focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/70 aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger/30 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted-foreground";

function Field({ id, label, children, className, error, required }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SectionHeadingProps {
  id: string;
  title: string;
  description: string;
}

function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6">
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-[-0.02em] text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function CivilDataForm({ initialData, onSubmit, onDirtyChange, loading, resetVersion = 0 }: CivilDataFormProps) {
  const initialDataRef = useRef(initialData);
  const formId = useId();

  const { control, register, reset, subscribe, formState: { errors, isDirty } } = useForm<CivilFormValues>({
    resolver: zodResolver(civilSchema),
    mode: "onChange",
    defaultValues: {
      nome: initialData?.nome || "",
      cpf: initialData?.cpf || "",
      sexo: initialData?.sexo || "Masculino",
      analfabeto: initialData?.analfabeto || false,
      capacidade_civil: initialData?.capacidade_civil || "Plena",
      cep: initialData?.cep || "",
      endereco: initialData?.endereco || "",
      bairro: initialData?.bairro || "",
      cidade: initialData?.cidade || "",
      telefone: initialData?.telefone || "",
      rep_nome: initialData?.rep_nome || "",
      rep_cpf: initialData?.rep_cpf || "",
      rep_rg: initialData?.rep_rg || "",
      rep_parentesco: initialData?.rep_parentesco || "",
      rep_endereco: initialData?.rep_endereco || "",
      rep_telefone: initialData?.rep_telefone || "",
      rg: initialData?.rg || "",
      orgao_expedidor: initialData?.orgao_expedidor || "",
      data_expedicao: initialData?.data_expedicao || "",
      nit: initialData?.nit || "",
      ctps: initialData?.ctps || "",
      nome_mae: initialData?.nome_mae || "",
      nome_pai: initialData?.nome_pai || "",
      estado_civil: initialData?.estado_civil || "Solteiro(a)",
      nome_conjuge: initialData?.nome_conjuge || "",
      cpf_conjuge: initialData?.cpf_conjuge || "",
      telefone_recado: initialData?.telefone_recado || "",
    }
  });

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    const nextInitialData = initialDataRef.current;
    if (!nextInitialData || Object.keys(nextInitialData).length === 0) return;

    reset((currentValues) => ({
      ...currentValues,
      ...nextInitialData,
    }));
  }, [reset, resetVersion]);

  useEffect(() => {
    return subscribe({
      formState: { values: true },
      callback: ({ values }) => onSubmit(values),
    });
  }, [subscribe, onSubmit]);

  useEffect(() => {
    if (isDirty) onDirtyChange?.(true);
  }, [isDirty, onDirtyChange]);

  const isIncapaz = useWatch({ control, name: "capacidade_civil" }) !== "Plena";
  const isAnalfabeto = useWatch({ control, name: "analfabeto" });
  const estadoCivil = useWatch({ control, name: "estado_civil" });

  const idFor = (field: keyof CivilFormValues) => `${formId}-${field}`;

  return (
    <fieldset
      disabled={loading}
      aria-busy={loading}
      className="overflow-hidden rounded-surface bg-card shadow-panel ring-1 ring-border/80 disabled:cursor-wait"
    >
      <legend className="sr-only">Dados civis e de contato do cliente</legend>
      <section aria-labelledby={`${formId}-personal-heading`} className="border-b border-border/70 last:border-0">
        <Surface variant="subtle" padding="lg" className="rounded-none bg-card shadow-none ring-0">
          <SectionHeading
            id={`${formId}-personal-heading`}
            title="Dados pessoais"
            description="Identificação principal do segurado."
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field
              id={idFor("nome")}
              label="Nome completo"
              error={errors.nome?.message}
              required
              className="md:col-span-2"
            >
              <input
                id={idFor("nome")}
                {...register("nome")}
                autoComplete="name"
                aria-required="true"
                aria-invalid={Boolean(errors.nome)}
                aria-describedby={errors.nome ? `${idFor("nome")}-error` : undefined}
                className={cn(controlClassName, errors.nome && "border-danger focus:border-danger")}
                placeholder="Nome do segurado"
              />
            </Field>

            <Field id={idFor("cpf")} label="CPF" error={errors.cpf?.message} required>
              <input
                id={idFor("cpf")}
                {...register("cpf", {
                  onChange: (e) => { e.target.value = maskCPF(e.target.value); }
                })}
                maxLength={14}
                inputMode="numeric"
                aria-required="true"
                aria-invalid={Boolean(errors.cpf)}
                aria-describedby={errors.cpf ? `${idFor("cpf")}-error` : undefined}
                className={cn(controlClassName, "tabular-nums", errors.cpf && "border-danger focus:border-danger")}
                placeholder="000.000.000-00"
              />
            </Field>

            <Field
              id={idFor("data_nascimento")}
              label="Data de nascimento"
              error={errors.data_nascimento?.message}
              required
            >
              <input
                id={idFor("data_nascimento")}
                type="date"
                {...register("data_nascimento")}
                autoComplete="bday"
                aria-required="true"
                aria-invalid={Boolean(errors.data_nascimento)}
                aria-describedby={errors.data_nascimento ? `${idFor("data_nascimento")}-error` : undefined}
                className={cn(controlClassName, errors.data_nascimento && "border-danger focus:border-danger")}
              />
            </Field>

            <Field id={idFor("sexo")} label="Sexo">
              <select id={idFor("sexo")} {...register("sexo")} className={controlClassName}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
              </select>
            </Field>

            <Field
              id={idFor("capacidade_civil")}
              label={(
                <span className="flex items-center gap-1.5">
                  Capacidade civil
                  {isIncapaz ? <AlertTriangle size={14} className="text-warning" aria-hidden="true" /> : null}
                </span>
              )}
            >
              <select
                id={idFor("capacidade_civil")}
                {...register("capacidade_civil")}
                className={cn(
                  controlClassName,
                  isIncapaz && "border-warning/50 bg-warning-subtle text-warning-foreground focus:border-warning",
                )}
              >
                <option value="Plena">Plena (Padrão)</option>
                <option value="Relativamente Incapaz">Relativamente Incapaz (16-18)</option>
                <option value="Absolutamente Incapaz">Absolutamente Incapaz (Menor/Curatelado)</option>
              </select>
            </Field>

            <div className="flex items-end">
              <div
                className={cn(
                  "flex min-h-11 w-full items-center gap-3 rounded-control border px-3 transition-colors",
                  isAnalfabeto
                    ? "border-warning/40 bg-warning-subtle text-warning-foreground"
                  : "border-border bg-surface-subtle/60 text-foreground",
                )}
              >
                <input
                  type="checkbox"
                  id={idFor("analfabeto")}
                  {...register("analfabeto")}
                  className="h-4 w-4 rounded border-input accent-brand focus:ring-2 focus:ring-ring/70"
                />
                <label htmlFor={idFor("analfabeto")} className="flex flex-1 cursor-pointer select-none items-center gap-2 text-sm font-medium">
                  <PenTool size={16} aria-hidden="true" /> Não assina / pessoa analfabeta
                </label>
              </div>
            </div>
          </div>
        </Surface>
      </section>

      <section aria-labelledby={`${formId}-documents-heading`} className="border-b border-border/70 last:border-0">
        <Surface variant="subtle" padding="lg" className="rounded-none bg-card shadow-none ring-0">
          <SectionHeading
            id={`${formId}-documents-heading`}
            title="Documentos previdenciários e civis"
            description="Registros utilizados na instrução e no atendimento previdenciário."
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field id={idFor("rg")} label="RG">
              <input id={idFor("rg")} {...register("rg")} className={controlClassName} />
            </Field>

            <Field id={idFor("orgao_expedidor")} label="Órgão expedidor">
              <input id={idFor("orgao_expedidor")} {...register("orgao_expedidor")} className={controlClassName} />
            </Field>

            <Field id={idFor("data_expedicao")} label="Data de expedição">
              <input id={idFor("data_expedicao")} type="date" {...register("data_expedicao")} className={controlClassName} />
            </Field>

            <Field id={idFor("nit")} label="NIT / PIS">
              <input id={idFor("nit")} {...register("nit")} className={cn(controlClassName, "tabular-nums")} />
            </Field>

            <Field id={idFor("ctps")} label="CTPS">
              <input id={idFor("ctps")} {...register("ctps")} className={cn(controlClassName, "tabular-nums")} />
            </Field>
          </div>
        </Surface>
      </section>

      <section aria-labelledby={`${formId}-family-heading`} className="border-b border-border/70 last:border-0">
        <Surface variant="subtle" padding="lg" className="rounded-none bg-card shadow-none ring-0">
          <SectionHeading
            id={`${formId}-family-heading`}
            title="Família e representação"
            description="Filiação, estado civil e responsável legal, quando aplicável."
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field id={idFor("nome_mae")} label="Nome da mãe">
              <input id={idFor("nome_mae")} {...register("nome_mae")} className={controlClassName} />
            </Field>

            <Field id={idFor("nome_pai")} label="Nome do pai">
              <input id={idFor("nome_pai")} {...register("nome_pai")} className={controlClassName} />
            </Field>

            <Field id={idFor("estado_civil")} label="Estado civil">
              <select id={idFor("estado_civil")} {...register("estado_civil")} className={controlClassName}>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
                <option value="União Estável">União Estável</option>
              </select>
            </Field>

            {estadoCivil?.includes("Casado") || estadoCivil === "União Estável" ? (
              <>
                <Field id={idFor("nome_conjuge")} label="Nome do cônjuge">
                  <input id={idFor("nome_conjuge")} {...register("nome_conjuge")} className={controlClassName} />
                </Field>
                <Field id={idFor("cpf_conjuge")} label="CPF do cônjuge">
                  <input
                    id={idFor("cpf_conjuge")}
                    {...register("cpf_conjuge", {
                      onChange: (e) => { e.target.value = maskCPF(e.target.value); }
                    })}
                    maxLength={14}
                    inputMode="numeric"
                    className={cn(controlClassName, "tabular-nums")}
                    placeholder="000.000.000-00"
                  />
                </Field>
              </>
            ) : null}

            {isIncapaz ? (
              <div className="rounded-control bg-warning-subtle/60 p-4 md:col-span-2">
                <div className="mb-4 flex items-start gap-2.5 border-b border-warning/20 pb-3">
                  <Shield size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-warning-foreground">Representante legal</h3>
                    <p className="mt-0.5 text-xs text-warning-foreground/80">
                      Preencha os dados da pessoa responsável pela representação civil.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <Field id={idFor("rep_nome")} label="Nome do representante">
                    <input id={idFor("rep_nome")} {...register("rep_nome")} className={controlClassName} />
                  </Field>

                  <Field id={idFor("rep_parentesco")} label="Vínculo">
                    <select id={idFor("rep_parentesco")} {...register("rep_parentesco")} className={controlClassName}>
                      <option value="">Selecione...</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Tutor">Tutor</option>
                      <option value="Curador">Curador</option>
                    </select>
                  </Field>

                  <Field id={idFor("rep_cpf")} label="CPF do representante">
                    <input
                      id={idFor("rep_cpf")}
                      {...register("rep_cpf", {
                        onChange: (e) => { e.target.value = maskCPF(e.target.value); }
                      })}
                      maxLength={14}
                      inputMode="numeric"
                      className={cn(controlClassName, "tabular-nums")}
                      placeholder="000.000.000-00"
                    />
                  </Field>

                  <Field id={idFor("rep_rg")} label="RG do representante">
                    <input id={idFor("rep_rg")} {...register("rep_rg")} className={controlClassName} />
                  </Field>

                  <Field id={idFor("rep_telefone")} label="Telefone do representante">
                    <input
                      id={idFor("rep_telefone")}
                      {...register("rep_telefone", {
                        onChange: (e) => { e.target.value = maskPhone(e.target.value); }
                      })}
                      maxLength={15}
                      inputMode="tel"
                      autoComplete="tel"
                      className={controlClassName}
                      placeholder="(00) 00000-0000"
                    />
                  </Field>

                  <Field id={idFor("rep_endereco")} label="Endereço do representante" className="md:col-span-2">
                    <input id={idFor("rep_endereco")} {...register("rep_endereco")} className={controlClassName} />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>
        </Surface>
      </section>

      <section aria-labelledby={`${formId}-contact-heading`} className="border-b border-border/70 last:border-0">
        <Surface variant="subtle" padding="lg" className="rounded-none bg-card shadow-none ring-0">
          <SectionHeading
            id={`${formId}-contact-heading`}
            title="Endereço e contato"
            description="Localização e canais para comunicação com o segurado."
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <Field id={idFor("cep")} label="CEP">
              <input
                id={idFor("cep")}
                {...register("cep", {
                  onChange: (e) => { e.target.value = maskCEP(e.target.value); }
                })}
                maxLength={9}
                inputMode="numeric"
                autoComplete="postal-code"
                className={cn(controlClassName, "tabular-nums")}
                placeholder="00000-000"
              />
            </Field>

            <Field id={idFor("endereco")} label="Endereço">
              <input id={idFor("endereco")} {...register("endereco")} autoComplete="street-address" className={controlClassName} />
            </Field>

            <Field id={idFor("bairro")} label="Bairro">
              <input id={idFor("bairro")} {...register("bairro")} autoComplete="address-level3" className={controlClassName} />
            </Field>

            <Field id={idFor("cidade")} label="Cidade / UF">
              <input id={idFor("cidade")} {...register("cidade")} autoComplete="address-level2" className={controlClassName} />
            </Field>

            <Field id={idFor("telefone")} label="Telefone celular">
              <input
                id={idFor("telefone")}
                {...register("telefone", {
                  onChange: (e) => { e.target.value = maskPhone(e.target.value); }
                })}
                maxLength={15}
                inputMode="tel"
                autoComplete="tel"
                className={controlClassName}
                placeholder="(00) 00000-0000"
              />
            </Field>

            <Field id={idFor("telefone_recado")} label="Telefone de recado / parente">
              <input
                id={idFor("telefone_recado")}
                {...register("telefone_recado", {
                  onChange: (e) => { e.target.value = maskPhone(e.target.value); }
                })}
                maxLength={15}
                inputMode="tel"
                className={controlClassName}
                placeholder="(00) 00000-0000"
              />
            </Field>
          </div>
        </Surface>
      </section>
    </fieldset>
  );
}
