import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutList, ChevronRight, ShoppingBag } from "lucide-react";
import { ruralSchema } from "../../schemas/clientSchemas";
import { z } from "zod";
import { maskCPF } from "../../lib/utils";

type RuralFormValues = z.infer<typeof ruralSchema>;

interface RuralDataFormProps {
  initialData?: Partial<RuralFormValues>;
  onSave: (data: RuralFormValues) => void;
  loading?: boolean;
  resetVersion?: number;
}

export function RuralDataForm({ initialData, onSave, loading, resetVersion = 0 }: RuralDataFormProps) {
  const initialDataRef = useRef(initialData);

  const { register, reset, subscribe } = useForm<RuralFormValues>({
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
    }
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

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = maskCPF(e.target.value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
          <LayoutList size={20} className="text-emerald-500"/> Caracterização do Imóvel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Nome do Imóvel</label>
            <input {...register("nome_imovel")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Município / UF</label>
            <input {...register("municipio_uf")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">ITR / NIRF / CCIR</label>
            <input {...register("itr_nirf")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Área Total (Ha)</label>
              <input {...register("area_total")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Condição de Posse</label>
              <div className="relative">
                <select {...register("condicao_posse")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm appearance-none outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all">
                  <option value="proprietario">Proprietário</option>
                  <option value="posseiro">Posseiro</option>
                  <option value="arrendatario">Arrendatário</option>
                  <option value="parceiro">Parceiro / Meeiro</option>
                  <option value="comodatario">Comodatário</option>
                  <option value="assentado">Assentado</option>
                </select>
                <ChevronRight size={14} className="absolute right-3 top-3.5 rotate-90 text-slate-400 pointer-events-none"/>
              </div>
            </div>
          </div>

          {/* DADOS DO PROPRIETÁRIO */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Nome do Proprietário (Se não for)</label>
              <input {...register("outorgante_nome")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all"/>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">CPF do Proprietário</label>
              <input {...register("outorgante_cpf")} disabled={loading} onChange={handleCpfChange} maxLength={14} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white transition-all"/>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
          <ShoppingBag size={20} className="text-emerald-500"/> Produção & Família
        </h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">O que produz/cria?</label>
            <textarea {...register("culturas")} disabled={loading} rows={2} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Locais de Venda</label>
            <input {...register("locais_venda")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Tem Empregados?</label>
              <select {...register("tem_empregados")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all">
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Tempo com Empregados?</label>
              <input {...register("tempo_empregados")} disabled={loading} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block ml-1">Grupo Familiar (Quem ajuda?)</label>
            <textarea {...register("grupo_familiar")} disabled={loading} rows={2} className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white transition-all"/>
          </div>
        </div>
      </div>
    </div>
  );
}
