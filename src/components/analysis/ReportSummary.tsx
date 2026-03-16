import { Brain, User } from 'lucide-react';
import { Client } from '../../types';
import { InterviewExtended } from '../../hooks/useMasterReport';

interface ReportSummaryProps {
  cliente: Client;
  interview: InterviewExtended | null;
  aiSummary: string;
  formatDate: (dateString?: string | null) => string;
  showDadosCadastrais: boolean;
  showResumoIa: boolean;
}

export function ReportSummary({
  cliente,
  interview,
  aiSummary,
  formatDate,
  showDadosCadastrais,
  showResumoIa,
}: ReportSummaryProps) {
  if (!showDadosCadastrais && !showResumoIa) return null;

  return (
    <div className="p-[20mm] page-break-after">
      <h2 className="text-2xl font-black border-b-2 border-slate-900 pb-2 mb-6 uppercase flex items-center gap-2">
        <User size={24} /> Qualificação do Segurado
      </h2>
      {showDadosCadastrais && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-10 text-[10pt]">
          <div>
            <strong>NOME:</strong> {cliente.nome}
          </div>
          <div>
            <strong>CPF:</strong> {cliente.cpf}
          </div>
          <div>
            <strong>RG:</strong> {cliente.rg || '-'}
          </div>
          <div>
            <strong>NASCIMENTO:</strong> {formatDate(cliente.data_nascimento)}
          </div>
          <div>
            <strong>ESTADO CIVIL:</strong> {cliente.estado_civil}
          </div>
          <div>
            <strong>PROFISSÃO:</strong> {cliente.profissao}
          </div>
          <div className="col-span-2">
            <strong>ENDEREÇO:</strong> {cliente.endereco}, {cliente.bairro}, {cliente.cidade} - CEP: {cliente.cep}
          </div>
        </div>
      )}
      {showResumoIa && (
        <div className="mb-10 no-break">
          <h3 className="font-bold text-lg bg-slate-100 p-2 border-l-4 border-purple-500 mb-4 flex items-center gap-2">
            <Brain size={18} className="text-purple-600" /> Resumo Executivo (IA)
          </h3>
          {aiSummary ? (
            <p className="text-justify italic text-slate-800 bg-purple-50/50 p-4 rounded-r-lg border border-purple-100">
              {aiSummary}
            </p>
          ) : (
            <p className="text-slate-400 italic">Resumo não gerado. Utilize a barra lateral para acionar a IA.</p>
          )}
        </div>
      )}
      {showDadosCadastrais && interview && (
        <div className="no-break">
          <h3 className="font-bold text-lg bg-slate-100 p-2 border-l-4 border-emerald-500 mb-4">Caracterização Rural (Ficha)</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[10pt] bg-slate-50 p-4 border border-slate-200">
            <div>
              <strong>IMÓVEL:</strong> {interview.dados_rurais?.nome_imovel || '-'}
            </div>
            <div>
              <strong>ÁREA:</strong> {interview.dados_rurais?.area_total || '-'}
            </div>
            <div>
              <strong>CONDIÇÃO:</strong> <span className="uppercase">{interview.dados_rurais?.condicao_posse || '-'}</span>
            </div>
            <div>
              <strong>PRODUÇÃO:</strong> {interview.dados_rurais?.culturas || '-'}
            </div>
            <div className="col-span-2 mt-2 pt-2 border-t border-slate-200">
              <strong className="block mb-1">NARRATIVA FÁTICA / HISTÓRICO:</strong>
              <p className="text-justify text-[9pt] leading-normal">{interview.historico_locais || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
