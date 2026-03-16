import { Activity, Heart } from 'lucide-react';

interface SpecificParamsProps {
  showDII: boolean;
  showPensao: boolean;
  selectedBenefit: string;
  extraParams: {
    data_dii: string;
    is_acidente: boolean;
    data_obito: string;
    data_casamento: string;
    idade_conjuge_obito: number;
  };
  setExtraParams: (params: any) => void;
}

export function SpecificParams({
  showDII,
  showPensao,
  selectedBenefit,
  extraParams,
  setExtraParams,
}: SpecificParamsProps) {
  if (!showDII && !showPensao) return null;

  return (
    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
      <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-sm">
        {showDII ? <Activity size={16} /> : <Heart size={16} />} Parâmetros Específicos: {selectedBenefit}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showDII && (
          <>
            <div>
              <label className="text-xs font-bold text-blue-700/70 mb-1 block">Data Início Incapacidade (DII)</label>
              <input
                type="date"
                value={extraParams.data_dii}
                onChange={(e) => setExtraParams({ ...extraParams, data_dii: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-bold text-blue-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraParams.is_acidente}
                  onChange={(e) => setExtraParams({ ...extraParams, is_acidente: e.target.checked })}
                  className="w-5 h-5 accent-blue-600"
                />{' '}
                Acidente / Doença Grave?
              </label>
            </div>
          </>
        )}
        {showPensao && (
          <>
            <div>
              <label className="text-xs font-bold text-blue-700/70 mb-1 block">Data do Óbito</label>
              <input
                type="date"
                value={extraParams.data_obito}
                onChange={(e) => setExtraParams({ ...extraParams, data_obito: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-700/70 mb-1 block">Data Casamento/União</label>
              <input
                type="date"
                value={extraParams.data_casamento}
                onChange={(e) => setExtraParams({ ...extraParams, data_casamento: e.target.value })}
                className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-blue-700/70 mb-1 block">Idade Cônjuge (no Óbito)</label>
              <input
                type="number"
                value={extraParams.idade_conjuge_obito}
                onChange={(e) => setExtraParams({ ...extraParams, idade_conjuge_obito: Number(e.target.value) })}
                className="w-full p-2 border border-blue-200 rounded-lg bg-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
