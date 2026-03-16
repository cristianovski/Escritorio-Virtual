import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldAlert,
  Plus,
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react';

export interface TimelineBlock {
  id: string;
  type: 'rural' | 'urbano' | 'urbano_familiar';
  startDate: string;
  endDate: string;
  description: string;
}

export interface TimelineDocument {
  id: string;
  date: string;
  type: 'ir' | 'retorno'; // Instrumento Ratificador ou Prova de Retorno
  description: string;
  haloMonths: number; // Quantos meses para trás e para frente ele "ilumina"
}

interface StrategicTimelineProps {
  der: string; // Data de Entrada do Requerimento
}

export function StrategicTimeline({ der }: StrategicTimelineProps) {
  // Inicializa a DER, default para hoje se não fornecida
  const baseDer = der || new Date().toISOString().split('T')[0];

  // Mock inicial para demonstração
  const [blocks, setBlocks] = useState<TimelineBlock[]>([
    {
      id: crypto.randomUUID(),
      type: 'rural',
      startDate: '2010-01-01',
      endDate: '2015-12-31',
      description: 'Sítio São João'
    },
    {
      id: crypto.randomUUID(),
      type: 'urbano',
      startDate: '2016-01-01',
      endDate: '2016-03-15',
      description: 'Safra temporária (74 dias)'
    },
    {
      id: crypto.randomUUID(),
      type: 'rural',
      startDate: '2016-03-16',
      endDate: '2020-05-10',
      description: 'Arrendamento'
    },
    {
      id: crypto.randomUUID(),
      type: 'urbano',
      startDate: '2020-05-11',
      endDate: '2021-02-10',
      description: 'Trabalho na cidade (275 dias)'
    },
    {
      id: crypto.randomUUID(),
      type: 'urbano_familiar',
      startDate: '2021-03-01',
      endDate: '2022-12-31',
      description: 'Filho trabalhando na cidade'
    },
    {
      id: crypto.randomUUID(),
      type: 'rural',
      startDate: '2021-03-01',
      endDate: baseDer,
      description: 'Retorno ao campo'
    }
  ]);

  const [documents, setDocuments] = useState<TimelineDocument[]>([
    {
      id: crypto.randomUUID(),
      date: '2012-05-10',
      type: 'ir',
      description: 'Certidão de Casamento',
      haloMonths: 36 // 3 anos para cada lado
    },
    {
      id: crypto.randomUUID(),
      date: '2021-03-15',
      type: 'retorno',
      description: 'Nota Fiscal Produtor (Retorno)',
      haloMonths: 12
    }
  ]);

  const [newBlock, setNewBlock] = useState<Partial<TimelineBlock>>({
    type: 'rural',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [newDoc, setNewDoc] = useState<Partial<TimelineDocument>>({
    type: 'ir',
    date: '',
    description: '',
    haloMonths: 36
  });

  // Cálculos de data
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateMonths = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  };

  const addBlock = () => {
    if (newBlock.startDate && newBlock.endDate && newBlock.type) {
      setBlocks([...blocks, { ...newBlock, id: crypto.randomUUID() } as TimelineBlock]);
      setNewBlock({ type: 'rural', startDate: '', endDate: '', description: '' });
    }
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const addDoc = () => {
    if (newDoc.date && newDoc.type) {
      setDocuments([...documents, { ...newDoc, id: crypto.randomUUID() } as TimelineDocument]);
      setNewDoc({ type: 'ir', date: '', description: '', haloMonths: 36 });
    }
  };

  const removeDoc = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  // Processamento da Linha do Tempo
  const processedTimeline = useMemo(() => {
    // Ordena blocos cronologicamente
    const sortedBlocks = [...blocks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    let totalValidRuralMonths = 0;
    let cutDate: Date | null = null;
    let pendingRetorno = false;
    let hasFamilyUrban = false;

    const analyzedBlocks = sortedBlocks.map(block => {
      const days = calculateDays(block.startDate, block.endDate);
      const months = calculateMonths(block.startDate, block.endDate);

      let status: 'valid' | 'warning' | 'cut' | 'blocked' = 'valid';
      let issue = '';

      // Verifica documentos de retorno
      if (pendingRetorno) {
        const hasRetorno = documents.some(d =>
          d.type === 'retorno' &&
          new Date(d.date) >= new Date(block.startDate) &&
          new Date(d.date) <= new Date(block.endDate)
        );

        if (hasRetorno) {
          pendingRetorno = false;
          cutDate = null;
        } else if (block.type === 'rural') {
          status = 'blocked';
          issue = 'Falta Prova de Retorno (Tema 301 TNU)';
        }
      }

      if (block.type === 'urbano') {
        if (days <= 120) {
          status = 'warning';
          issue = 'Vínculo Urbano Curto (<= 120 dias). Não corta carência.';
        } else {
          status = 'cut';
          issue = 'Vínculo Urbano > 120 dias. Corta carência.';
          pendingRetorno = true;
          cutDate = new Date(block.endDate);
        }
      }

      if (block.type === 'urbano_familiar') {
        status = 'warning';
        hasFamilyUrban = true;
        issue = 'Urbano Familiar. Necessário provar indispensabilidade da renda (Súmula 41 TNU).';
      }

      if (block.type === 'rural' && status === 'valid') {
        totalValidRuralMonths += Math.max(0, months);
      }

      return { ...block, status, issue, days, months };
    });

    return {
      blocks: analyzedBlocks,
      totalValidRuralMonths,
      hasFamilyUrban,
      pendingRetorno
    };
  }, [blocks, documents]);

  // Escala de tempo (15 anos retroativos)
  const timelineStart = new Date(baseDer);
  timelineStart.setFullYear(timelineStart.getFullYear() - 15);
  const totalTimelineTime = new Date(baseDer).getTime() - timelineStart.getTime();

  const getPositionPercent = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    if (time < timelineStart.getTime()) return 0;
    if (time > new Date(baseDer).getTime()) return 100;
    return ((time - timelineStart.getTime()) / totalTimelineTime) * 100;
  };

  const getWidthPercent = (startStr: string, endStr: string) => {
    const start = Math.max(new Date(startStr).getTime(), timelineStart.getTime());
    const end = Math.min(new Date(endStr).getTime(), new Date(baseDer).getTime());
    if (start > end) return 0;
    return ((end - start) / totalTimelineTime) * 100;
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm mt-8">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 flex items-center gap-3">
        <Clock className="text-emerald-200" />
        <div>
          <h2 className="font-bold text-lg">Canvas de Provas (Linha do Tempo Estratégica)</h2>
          <p className="text-emerald-100 text-sm">Período Retroativo de 15 Anos (180 meses) a partir da DER: {new Date(baseDer).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="p-6">
        {/* Adicionar Bloco / Documento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Form Blocos */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar size={18} /> Adicionar Período
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-500">Tipo</label>
                <select
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newBlock.type}
                  onChange={e => setNewBlock({...newBlock, type: e.target.value as any})}
                >
                  <option value="rural">Rural</option>
                  <option value="urbano">Urbano</option>
                  <option value="urbano_familiar">Urbano Familiar</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Descrição</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  placeholder="Ex: Sítio..."
                  value={newBlock.description}
                  onChange={e => setNewBlock({...newBlock, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Início</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newBlock.startDate}
                  onChange={e => setNewBlock({...newBlock, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Fim</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newBlock.endDate}
                  onChange={e => setNewBlock({...newBlock, endDate: e.target.value})}
                />
              </div>
            </div>
            <button
              onClick={addBlock}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              <Plus size={16} /> Adicionar Bloco
            </button>
          </div>

          {/* Form Documentos */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <FileText size={18} /> Adicionar Documento / Prova
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-slate-500">Tipo</label>
                <select
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newDoc.type}
                  onChange={e => setNewDoc({...newDoc, type: e.target.value as any})}
                >
                  <option value="ir">Instrumento Ratificador (IR)</option>
                  <option value="retorno">Prova de Retorno</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Descrição</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  placeholder="Ex: Certidão..."
                  value={newDoc.description}
                  onChange={e => setNewDoc({...newDoc, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Data do Documento</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newDoc.date}
                  onChange={e => setNewDoc({...newDoc, date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Halo (Meses)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded text-sm bg-slate-50"
                  value={newDoc.haloMonths}
                  onChange={e => setNewDoc({...newDoc, haloMonths: Number(e.target.value)})}
                />
              </div>
            </div>
            <button
              onClick={addDoc}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white p-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition"
            >
              <Plus size={16} /> Adicionar Documento
            </button>
          </div>
        </div>

        {/* Visualização da Linha do Tempo */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-inner mb-8 overflow-x-auto">
          <div className="min-w-[800px] relative pt-12 pb-16">
            {/* Eixo X (Anos) */}
            <div className="absolute top-0 left-0 w-full flex justify-between text-xs font-bold text-slate-400 border-b border-slate-200 pb-2">
              <span>{timelineStart.getFullYear()} (Início 15 anos)</span>
              <span>DER ({new Date(baseDer).getFullYear()})</span>
            </div>

            {/* Linha Principal (Rural/Urbano Requerente) */}
            <div className="relative h-12 bg-slate-100 rounded-md border border-slate-200 mt-4 flex items-center">

              {/* Halos de Documentos */}
              {documents.map(doc => {
                const docDate = new Date(doc.date);
                const haloStart = new Date(docDate);
                haloStart.setMonth(haloStart.getMonth() - doc.haloMonths);
                const haloEnd = new Date(docDate);
                haloEnd.setMonth(haloEnd.getMonth() + doc.haloMonths);

                const left = getPositionPercent(haloStart.toISOString());
                const width = getWidthPercent(haloStart.toISOString(), haloEnd.toISOString());

                if (width <= 0) return null;

                return (
                  <div
                    key={`halo-${doc.id}`}
                    className="absolute h-16 top-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0 mix-blend-multiply"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: doc.type === 'ir'
                        ? 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%)'
                        : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0) 70%)'
                    }}
                  />
                );
              })}

              {/* Blocos da Linha Principal */}
              {processedTimeline.blocks.filter(b => b.type !== 'urbano_familiar').map(block => {
                const left = getPositionPercent(block.startDate);
                const width = getWidthPercent(block.startDate, block.endDate);

                if (width <= 0) return null;

                let bg = 'bg-emerald-500';
                if (block.status === 'warning') bg = 'bg-amber-500';
                if (block.status === 'cut') bg = 'bg-red-500';
                if (block.status === 'blocked') bg = 'bg-slate-300 repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.1) 5px, rgba(0,0,0,0.1) 10px)';

                return (
                  <div
                    key={block.id}
                    className={`absolute h-8 top-1/2 -translate-y-1/2 rounded ${bg} border border-black/10 shadow-sm cursor-help group z-10 transition-all hover:scale-y-110`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs p-2 rounded whitespace-nowrap z-50 shadow-lg">
                      <div className="font-bold">{block.type.toUpperCase()}</div>
                      <div>{block.description}</div>
                      <div>{new Date(block.startDate).toLocaleDateString()} a {new Date(block.endDate).toLocaleDateString()}</div>
                      <div className="text-emerald-300">{block.months} meses ({block.days} dias)</div>
                      {block.issue && <div className="text-amber-300 mt-1 max-w-[200px] whitespace-normal break-words">{block.issue}</div>}
                    </div>
                  </div>
                );
              })}

              {/* Marcadores de Documentos */}
              {documents.map(doc => {
                const left = getPositionPercent(doc.date);
                if (left < 0 || left > 100) return null;

                return (
                  <div
                    key={doc.id}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-20 group cursor-help"
                    style={{
                      left: `${left}%`,
                      backgroundColor: doc.type === 'ir' ? '#10b981' : '#a855f7'
                    }}
                  >
                    {/* Tooltip Doc */}
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs p-2 rounded whitespace-nowrap z-50">
                      <div className="font-bold">{doc.type === 'ir' ? 'Instrumento Ratificador' : 'Prova de Retorno'}</div>
                      <div>{doc.description}</div>
                      <div>Data: {new Date(doc.date).toLocaleDateString()}</div>
                      <div className="text-emerald-300">Halo: {doc.haloMonths} meses</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Linha Paralela (Urbano Familiar - Blindagem) */}
            <div className="relative h-6 bg-slate-50 rounded-md border border-slate-200 mt-10 flex items-center border-dashed">
              <span className="absolute -top-5 left-0 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trilha Paralela: Grupo Familiar</span>
              {processedTimeline.blocks.filter(b => b.type === 'urbano_familiar').map(block => {
                const left = getPositionPercent(block.startDate);
                const width = getWidthPercent(block.startDate, block.endDate);

                if (width <= 0) return null;

                return (
                  <div
                    key={block.id}
                    className="absolute h-4 top-1/2 -translate-y-1/2 rounded bg-amber-400 border border-black/10 shadow-sm cursor-help group z-10"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  >
                     <div className="hidden group-hover:block absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs p-2 rounded whitespace-nowrap z-50 shadow-lg">
                      <div className="font-bold">URBANO FAMILIAR</div>
                      <div>{block.description}</div>
                      <div className="text-amber-300 mt-1 max-w-[200px] whitespace-normal break-words">{block.issue}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Avisos em tela sobre a linha do tempo */}
            {processedTimeline.pendingRetorno && (
              <div className="absolute top-2 right-0 text-red-500 flex items-center gap-1 text-xs font-bold animate-pulse">
                <AlertTriangle size={14} /> Faltam Provas de Retorno na Linha!
              </div>
            )}
          </div>
        </div>

        {/* Listagens de Dados e Painel de Viabilidade */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tabela de Blocos */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-700 text-sm">Detalhamento dos Períodos</h3>
            </div>
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 text-xs uppercase">
                  <tr>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Período</th>
                    <th className="p-3">Duração</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedTimeline.blocks.map(block => (
                    <tr key={block.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium uppercase text-xs">{block.type.replace('_', ' ')}</td>
                      <td className="p-3">
                        <div className="text-slate-700">{new Date(block.startDate).toLocaleDateString()} a</div>
                        <div className="text-slate-500">{new Date(block.endDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-3">
                        <div>{block.months} meses</div>
                        <div className="text-xs text-slate-400">{block.days} dias</div>
                      </td>
                      <td className="p-3">
                        {block.status === 'valid' && <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-bold">Válido</span>}
                        {block.status === 'warning' && <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold" title={block.issue}>Alerta</span>}
                        {block.status === 'cut' && <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold" title={block.issue}>Corte</span>}
                        {block.status === 'blocked' && <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-bold" title={block.issue}>Bloqueado</span>}
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeBlock(block.id)} className="text-slate-400 hover:text-red-500 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {processedTimeline.blocks.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-slate-400">Nenhum bloco adicionado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Painel de Viabilidade (Cálculo Final) */}
          <div className="space-y-4">
            <div className={`p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center h-48 transition-colors ${
              processedTimeline.totalValidRuralMonths >= 180
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              {processedTimeline.totalValidRuralMonths >= 180 ? (
                <>
                  <CheckCircle size={48} className="text-emerald-500 mb-2" />
                  <h3 className="font-black text-emerald-800 text-lg mb-1">Viabilidade Alta</h3>
                  <p className="text-emerald-700 font-medium text-sm">Aposentadoria por Idade Rural (60H/55M)</p>
                </>
              ) : (
                <>
                  <AlertCircle size={48} className="text-blue-500 mb-2" />
                  <h3 className="font-black text-blue-800 text-lg mb-1">Carência Insuficiente</h3>
                  <p className="text-blue-700 font-medium text-sm leading-tight mb-2">
                    Apenas {processedTimeline.totalValidRuralMonths} meses de 180 necessários.
                  </p>
                  <p className="text-blue-800/70 text-xs font-bold bg-blue-100/50 px-2 py-1 rounded">
                    Sugestão: Aposentadoria Híbrida<br/>Tema 1007 STJ (65H/62M)
                  </p>
                </>
              )}

              <div className="mt-4 text-2xl font-black text-slate-800">
                {processedTimeline.totalValidRuralMonths} <span className="text-sm font-normal text-slate-500">/ 180 meses</span>
              </div>
            </div>

            {/* Avisos Jurídicos */}
            {processedTimeline.hasFamilyUrban && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 shadow-sm">
                <ShieldAlert className="text-amber-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-amber-800 text-sm mb-1">Blindagem Familiar Necessária</h4>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Identificado vínculo urbano no grupo familiar. Prepare documentação provando a indispensabilidade da renda rural (Súmula 41 TNU) ou separação de economias.
                  </p>
                </div>
              </div>
            )}

            {processedTimeline.pendingRetorno && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 shadow-sm">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-red-800 text-sm mb-1">Quebra de Vínculo Rural</h4>
                  <p className="text-red-700 text-xs leading-relaxed">
                    Vínculo urbano superior a 120 dias identificado. Adicione uma <strong>Prova de Retorno</strong> na linha do tempo para revalidar os períodos rurais subsequentes (Tema 301 TNU).
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex gap-3 shadow-sm">
                <Info className="text-slate-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">Súmula 14 TNU (Halo de Eficácia)</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    A prova material não precisa abranger todo o período, possuindo eficácia retroativa e prospectiva. Utilize os <strong>Instrumentos Ratificadores</strong> no gráfico para cobrir "lacunas" visuais.
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}