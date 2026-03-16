import React from "react";
import { UseFormRegister } from "react-hook-form";
import { ShoppingBag } from "lucide-react";
import { RuralFormValues } from "../../../schemas/clientSchemas";

interface ProductionFamilyDetailsProps {
  register: UseFormRegister<RuralFormValues>;
}

export function ProductionFamilyDetails({ register }: ProductionFamilyDetailsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2 border-b pb-2">
        <ShoppingBag size={20} className="text-emerald-500" /> Produção & Família
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">O que produz/cria?</label>
          <textarea {...register("culturas")} rows={2} className="w-full p-3 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Locais de Venda</label>
          <input {...register("locais_venda")} className="w-full p-3 border rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Tem Empregados?</label>
            <select {...register("tem_empregados")} className="w-full p-3 border rounded-lg text-sm">
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Tempo com Empregados?</label>
            <input {...register("tempo_empregados")} className="w-full p-3 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Grupo Familiar (Quem ajuda?)</label>
          <textarea {...register("grupo_familiar")} rows={2} className="w-full p-3 border rounded-lg text-sm" />
        </div>
      </div>
    </div>
  );
}
