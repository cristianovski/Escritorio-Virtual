import React from "react";
import { UseFormRegister } from "react-hook-form";
import { LayoutList, ChevronRight } from "lucide-react";
import { RuralFormValues } from "../../../schemas/clientSchemas";
import { maskCPF } from "../../../lib/utils";

interface PropertyDetailsProps {
  register: UseFormRegister<RuralFormValues>;
}

export function PropertyDetails({ register }: PropertyDetailsProps) {
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = maskCPF(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
        <LayoutList size={20} className="text-emerald-500" /> Caracterização do Imóvel
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Nome do Imóvel</label>
          <input {...register("nome_imovel")} className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white transition" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Município / UF</label>
          <input {...register("municipio_uf")} className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white transition" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">ITR / NIRF / CCIR</label>
          <input {...register("itr_nirf")} className="w-full p-3 border rounded-lg text-sm bg-slate-50 focus:bg-white transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Área Total (Ha)</label>
            <input {...register("area_total")} className="w-full p-3 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Condição de Posse</label>
            <div className="relative">
              <select {...register("condicao_posse")} className="w-full p-3 border rounded-lg text-sm appearance-none bg-white">
                <option value="proprietario">Proprietário</option>
                <option value="posseiro">Posseiro</option>
                <option value="arrendatario">Arrendatário</option>
                <option value="parceiro">Parceiro / Meeiro</option>
                <option value="comodatario">Comodatário</option>
                <option value="assentado">Assentado</option>
              </select>
              <ChevronRight size={14} className="absolute right-3 top-3.5 rotate-90 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* DADOS DO PROPRIETÁRIO */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nome do Proprietário (Se não for)</label>
            <input {...register("outorgante_nome")} className="w-full p-3 border rounded-lg text-sm bg-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">CPF do Proprietário</label>
            <input {...register("outorgante_cpf")} onChange={handleCpfChange} maxLength={14} className="w-full p-3 border rounded-lg text-sm bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
