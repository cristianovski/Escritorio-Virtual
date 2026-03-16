import { Client } from '../../types';
import { OfficeProfileExtended } from '../../hooks/useMasterReport';

interface ReportCoverProps {
  cliente: Client;
  dataHoje: string;
  officeProfile: OfficeProfileExtended | null;
}

export function ReportCover({ cliente, dataHoje, officeProfile }: ReportCoverProps) {
  return (
    <div className="p-[20mm] h-[297mm] flex flex-col justify-center relative page-break-after">
      <div className="absolute top-0 left-0 w-4 h-full bg-blue-900"></div>
      <div className="pl-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Dossiê Previdenciário</h1>
        <h2 className="text-xl text-slate-500 font-medium mb-12">Análise de Viabilidade Rural</h2>
        <div className="bg-slate-50 p-6 border-l-4 border-blue-600 mb-12">
          <h3 className="font-bold text-lg mb-1">{cliente.nome}</h3>
          <p className="text-slate-600 font-mono">CPF: {cliente.cpf}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <strong className="uppercase">Data da Análise:</strong> {dataHoje}
          </p>
          <p>
            <strong className="uppercase">Responsável:</strong> {officeProfile?.nome_advogado || 'Advogado(a)'}
          </p>
          <p>
            <strong className="uppercase">Status:</strong> {cliente.status_processo || 'Em Análise'}
          </p>
        </div>
      </div>
    </div>
  );
}
