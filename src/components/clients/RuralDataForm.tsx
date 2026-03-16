import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ruralSchema } from "../../schemas/clientSchemas";
import { z } from "zod";

import { PropertyDetails } from "./rural-form/PropertyDetails";
import { ProductionFamilyDetails } from "./rural-form/ProductionFamilyDetails";
import { RuralNarrative } from "./rural-form/RuralNarrative";

type RuralFormValues = z.infer<typeof ruralSchema>;

interface RuralDataFormProps {
  initialData?: Partial<RuralFormValues>;
  historico?: string;
  onSave: (data: RuralFormValues, historico: string) => void;
  loading?: boolean;
}

export function RuralDataForm({ initialData, historico: initialHistorico, onSave, loading }: RuralDataFormProps) {
  const { register, handleSubmit } = useForm<RuralFormValues>({
    resolver: zodResolver(ruralSchema),
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

  const [historico, setHistorico] = useState(initialHistorico || "");

  const onSubmit = (data: RuralFormValues) => {
    onSave(data, historico);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <PropertyDetails register={register} />

      <ProductionFamilyDetails register={register} />

      <RuralNarrative historico={historico} setHistorico={setHistorico} />

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow transition-all disabled:opacity-50">
          {loading ? "Salvando..." : "Salvar Ficha Rural"}
        </button>
      </div>
    </form>
  );
}
