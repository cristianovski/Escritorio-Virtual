import { Scale } from 'lucide-react';
import { Client } from '../../types';
import { OfficeProfileExtended } from '../../hooks/useMasterReport';

interface ReportOpinionProps {
  cliente: Client;
  officeProfile: OfficeProfileExtended | null;
}

export function ReportOpinion({ cliente, officeProfile }: ReportOpinionProps) {
  if (!cliente.status_processo) return null;

  return (
    <div className="p-[20mm] page-break-after">
      <h2 className="text-2xl font-black border-b-2 border-slate-900 pb-2 mb-6 uppercase flex items-center gap-2">
        <Scale size={24} /> Parecer Conclusivo
      </h2>
      <div className="bg-slate-50 border border-slate-300 p-6 text-justify text-[10pt] leading-loose">
        <p className="mb-4">
          Com base na documentação apresentada, na entrevista colhida e na análise da linha do tempo contributiva/laboral,
          conclui-se que o segurado <strong>{cliente.nome}</strong> apresenta o status atual de:{' '}
          <strong>{cliente.status_processo.toUpperCase()}</strong>.
        </p>
        <p>
          A presente análise foi processada considerando as regras da Instrução Normativa PRES/INSS nº 128/2022 e a
          jurisprudência dominante (TNU e STJ) acerca da comprovação da qualidade de segurado especial em regime de economia
          familiar.
        </p>
        <div className="mt-12 text-center no-break">
          <div className="border-t border-black w-1/2 mx-auto pt-2">
            <p className="font-bold uppercase text-sm">{officeProfile?.nome_advogado || 'Advogado(a) Responsável'}</p>
            <p className="text-xs text-slate-500">{officeProfile?.oab || 'OAB'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
