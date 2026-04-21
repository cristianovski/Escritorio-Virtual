import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, PenTool, AlertTriangle, Shield } from "lucide-react";
import { civilSchema } from "../../schemas/clientSchemas";
import { z } from "zod";
import { maskCPF, maskPhone, maskCEP } from "../../lib/utils";

type CivilFormValues = z.infer<typeof civilSchema>;

interface CivilDataFormProps {
  initialData?: Partial<CivilFormValues>;
  onSubmit: (data: CivilFormValues) => void;
  loading?: boolean;
}

export function CivilDataForm({ initialData, onSubmit, loading }: CivilDataFormProps) {
  const { register, watch, reset, formState: { errors } } = useForm<CivilFormValues>({
    resolver: zodResolver(civilSchema),
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
      senha_meu_inss: initialData?.senha_meu_inss || "",
      nome_mae: initialData?.nome_mae || "",
      nome_pai: initialData?.nome_pai || "",
      estado_civil: initialData?.estado_civil || "Solteiro(a)",
      nome_conjuge: initialData?.nome_conjuge || "",
      cpf_conjuge: initialData?.cpf_conjuge || "",
      telefone_recado: initialData?.telefone_recado || "",
    }
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData as CivilFormValues);
    }
  }, [initialData, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      onSubmit(value as CivilFormValues);
    });
    return () => subscription.unsubscribe();
  }, [watch, onSubmit]);

  const isIncapaz = watch("capacidade_civil") !== "Plena";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
          <User className="text-emerald-500"/> 1. Identificação Civil
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome Completo</label>
            <input
              {...register("nome")}
              className={`w-full border rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all ${errors.nome ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="Nome do Segurado"
            />
            {errors.nome && <span className="text-red-500 text-xs">{errors.nome.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CPF</label>
            {/* MUDANÇA: A máscara agora atua JUNTO com o registro oficial */}
            <input
              {...register("cpf", {
                onChange: (e) => { e.target.value = maskCPF(e.target.value); }
              })}
              maxLength={14}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"
              placeholder="000.000.000-00"
            />
            {errors.cpf && <span className="text-red-500 text-xs">{errors.cpf.message}</span>}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
              Capacidade Civil {isIncapaz && <AlertTriangle size={12} className="text-amber-500"/>}
            </label>
            <select {...register("capacidade_civil")} className={`w-full border rounded-xl p-3 text-sm outline-none font-bold cursor-pointer focus:ring-4 focus:ring-emerald-500/10 transition-all ${isIncapaz ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-slate-300 bg-slate-50 focus:bg-white'}`}>
              <option value="Plena">Plena (Padrão)</option>
              <option value="Relativamente Incapaz">Relativamente Incapaz (16-18)</option>
              <option value="Absolutamente Incapaz">Absolutamente Incapaz (Menor/Curatelado)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Data de Nascimento</label>
            <input type="date" {...register("data_nascimento")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Sexo</label>
            <select {...register("sexo")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all">
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className={`flex items-center gap-3 p-3 border rounded-xl w-full transition-all cursor-pointer hover:shadow-sm ${watch("analfabeto") ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
              <input type="checkbox" id="analfabeto" {...register("analfabeto")} className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 accent-amber-500" />
              <label htmlFor="analfabeto" className={`text-sm font-bold cursor-pointer select-none flex items-center gap-2 w-full ${watch("analfabeto") ? 'text-amber-800' : 'text-slate-600'}`}>
                <PenTool size={16}/> Não Assina / Analfabeto
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">RG</label>
            <input {...register("rg")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Órgão Expedidor</label>
            <input {...register("orgao_expedidor")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Data Expedição</label>
            <input type="date" {...register("data_expedicao")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">NIT/PIS</label>
            <input {...register("nit")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CTPS</label>
            <input {...register("ctps")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha Meu INSS</label>
            <input {...register("senha_meu_inss")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome da Mãe</label>
            <input {...register("nome_mae")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome do Pai</label>
            <input {...register("nome_pai")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Estado Civil</label>
            <select {...register("estado_civil")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all">
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
              <option value="União Estável">União Estável</option>
            </select>
          </div>

          {watch("estado_civil")?.includes("Casado") || watch("estado_civil") === "União Estável" ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome do Cônjuge</label>
                <input {...register("nome_conjuge")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CPF do Cônjuge</label>
                <input
                  {...register("cpf_conjuge", {
                    onChange: (e) => { e.target.value = maskCPF(e.target.value); }
                  })}
                  maxLength={14}
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      {isIncapaz && (
        <section className="bg-amber-50 p-6 rounded-2xl shadow-sm border border-amber-200">
          <h2 className="text-lg font-bold text-amber-800 mb-6 flex items-center gap-2 border-b border-amber-200 pb-2">
            <Shield className="text-amber-600"/> Dados do Representante Legal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">Nome do Representante</label>
              <input {...register("rep_nome")} className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all"/>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">Vínculo</label>
              <select {...register("rep_parentesco")} className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all">
                <option value="">Selecione...</option>
                <option value="Mãe">Mãe</option>
                <option value="Pai">Pai</option>
                <option value="Tutor">Tutor</option>
                <option value="Curador">Curador</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">CPF Rep.</label>
              <input
                {...register("rep_cpf", {
                  onChange: (e) => { e.target.value = maskCPF(e.target.value); }
                })}
                maxLength={14}
                className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">RG Rep.</label>
              <input {...register("rep_rg")} className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all"/>
            </div>
            <div>
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">Telefone Rep.</label>
              <input
                {...register("rep_telefone", {
                  onChange: (e) => { e.target.value = maskPhone(e.target.value); }
                })}
                maxLength={15}
                className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all"
              />
            </div>
            <div className="col-span-1 md:col-span-3">
              <label className="text-xs font-bold text-amber-700/70 uppercase tracking-wider ml-1">Endereço Rep.</label>
              <input {...register("rep_endereco")} className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 bg-white transition-all"/>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">Contato & Localização</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">CEP</label>
            <input
              {...register("cep", {
                onChange: (e) => { e.target.value = maskCEP(e.target.value); }
              })}
              maxLength={9}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Endereço</label>
            <input {...register("endereco")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bairro</label>
            <input {...register("bairro")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cidade - UF</label>
            <input {...register("cidade")} className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">Telefone Celular</label>
            <input
              {...register("telefone", {
                onChange: (e) => { e.target.value = maskPhone(e.target.value); }
              })}
              maxLength={15}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">Telefone Recado / Parente</label>
            <input
              {...register("telefone_recado", {
                onChange: (e) => { e.target.value = maskPhone(e.target.value); }
              })}
              maxLength={15}
              className="w-full border border-slate-300 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
}