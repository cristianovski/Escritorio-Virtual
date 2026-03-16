import { Client } from '../../types';
import { OfficeProfileExtended } from '../../hooks/useMasterReport';

interface ReportProxyProps {
  cliente: Client;
  dataHoje: string;
  officeProfile: OfficeProfileExtended | null;
}

export function ReportProxy({ cliente, dataHoje, officeProfile }: ReportProxyProps) {
  return (
    <div className="p-[20mm]">
      <h2 className="text-center font-bold text-xl mb-12 uppercase tracking-wide border-b-2 border-black pb-2">
        Procuração Ad Judicia et Extra
      </h2>
      <p className="mb-6 text-justify">
        <strong className="uppercase">OUTORGANTE:</strong>{' '}
        <strong>{cliente.nome.toUpperCase()}</strong>, nacionalidade brasileira, estado civil {cliente.estado_civil || 'não informado'},{' '}
        {cliente.profissao || 'Agricultor(a)'}, inscrito(a) no CPF sob o nº {cliente.cpf}, residente e domiciliado(a) em{' '}
        {cliente.endereco || '_________________________________'}.
      </p>
      <p className="mb-6 text-justify">
        <strong className="uppercase">OUTORGADO(A):</strong>{' '}
        <strong>{officeProfile?.nome_advogado?.toUpperCase() || '_________________________________'}</strong>, advogado(a),
        inscrito(a) na OAB sob o nº <strong>{officeProfile?.oab || '___________'}</strong>, com escritório profissional em{' '}
        {officeProfile?.endereco_profissional || '_________________________________'}.
      </p>
      <p className="mb-6 text-justify">
        <strong className="uppercase">PODERES:</strong> Pelo presente instrumento, constitui seu procurador o outorgado,
        conferindo-lhe os poderes da cláusula <em>ad judicia et extra</em> para o foro em geral, especificamente para propor as
        ações cabíveis, acompanhando-as até final decisão, podendo, para tanto, transigir, fazer acordo, firmar compromisso,
        substabelecer, renunciar, desistir, receber e dar quitação, requerer administrativamente e praticar todos os atos
        necessários à defesa de seus direitos previdenciários.
      </p>
      <div className="mt-24 text-center no-break">
        <div className="border-t border-black w-2/3 mx-auto pt-2">
          <p className="font-bold uppercase">{cliente.nome}</p>
          <p className="text-xs text-slate-500">Outorgante</p>
        </div>
        <p className="mt-8 text-sm">
          {officeProfile?.cidade_uf?.split('/')[0] || 'Local'}, {dataHoje}.
        </p>
      </div>
    </div>
  );
}
