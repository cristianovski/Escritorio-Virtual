import { useState } from 'react';
import {
  ArrowLeft, Save, Calculator, Plus, Trash2, CheckCircle, 
  XCircle, Calendar, HelpCircle, Paperclip, Eye, Edit2, 
  X, FileText, FileDown, Search
} from 'lucide-react';
import { useBenefitAnalysis, Periodo } from '../../hooks/useBenefitAnalysis';
import { Client } from '../../types';
import StrategicTimeline from '../../components/StrategicTimeline';

const DOCUMENTOS_LEGAIS = [
  { nome: "Nenhum / Não informar", fund: "" },
  ...[
    { nome: "Autodeclaração do Segurado Especial", fund: "Art. 38-B, § 2º, da Lei 8.213/91; Art. 115 da IN 128/2022" },
    { nome: "Bases de Dados do Governo (InfoDAP, CAFIR, MEI, etc)", fund: "Art. 90, §§ 5º e 6º, da IN 128/2022" },
    { nome: "Bloco de notas do produtor rural", fund: "Art. 106, V, da Lei 8.213/91; Art. 116, III, da IN 128/2022" },
    { nome: "Caderneta da Capitania dos Portos ou SUDEPE", fund: "Art. 26, V, da Portaria DIRBEN/INSS 990/2022" },
    { nome: "Caderneta do seringueiro / Contrato SEMTA/SAVA", fund: "Regramento Extrativista Específico (IN 128/2022)" },
    { nome: "Carteira de vacinação e cartão da gestante", fund: "Art. 116, XXV, da IN 128/2022" },
    { nome: "Certidão de casamento civil ou religioso ou certidão de união estável", fund: "Art. 116, XI, da IN 128/2022" },
    { nome: "Certidão de nascimento ou de batismo dos filhos", fund: "Art. 116, XII, da IN 128/2022" },
    { nome: "Certidão de tutela ou de curatela", fund: "Art. 116, XIII, da IN 128/2022" },
    { nome: "Certidão fornecida pela FUNAI (para trabalhador rural indígena)", fund: "Art. 116, X, da IN 128/2022" },
    { nome: "Certificado de alistamento ou de quitação com o serviço militar", fund: "Art. 116, XVI, da IN 128/2022" },
    { nome: "Comprovante de empréstimo bancário para fins de atividade rural", fund: "Art. 116, XXVIII, da IN 128/2022" },
    { nome: "Comprovante de ITR, DIAC e/ou DIAT com envio à Receita Federal", fund: "Art. 116, IX, da IN 128/2022" },
    { nome: "Comprovante de matrícula, ficha, ata ou boletim escolar", fund: "Art. 116, XVII, da IN 128/2022" },
    { nome: "Comprovante de participação em programas governamentais para área rural", fund: "Art. 116, XIX, da IN 128/2022" },
    { nome: "Comprovante de recebimento de assistência técnica e extensão rural", fund: "Art. 116, XX, da IN 128/2022" },
    { nome: "Comprovantes de recolhimento de contribuição decorrentes de comercialização", fund: "Art. 106, VIII, da Lei 8.213/91; Art. 116, VI, da IN 128/2022" },
    { nome: "Contrato de arrendamento, parceria, meação ou comodato rural", fund: "Art. 106, II, da Lei 8.213/91; Art. 116, I, da IN 128/2022" },
    { nome: "Cópia da declaração de imposto de renda (IRPF) com renda rural", fund: "Art. 106, IX, da Lei 8.213/91; Art. 116, VII, da IN 128/2022" },
    { nome: "Declaração de Aptidão ao PRONAF (DAP) ou CAF", fund: "Art. 106, IV, da Lei 8.213/91; Art. 116, II, da IN 128/2022" },
    { nome: "Documentos fiscais de entrega de produção a cooperativa/entreposto", fund: "Art. 106, VII, da Lei 8.213/91; Art. 116, V, da IN 128/2022" },
    { nome: "Escritura pública de imóvel", fund: "Art. 116, XXI, da IN 128/2022" },
    { nome: "Ficha de associado em cooperativa", fund: "Art. 116, XVIII, da IN 128/2022" },
    { nome: "Ficha de atendimento médico ou odontológico", fund: "Art. 116, XXXV, da IN 128/2022" },
    { nome: "Ficha de inscrição sindical ou associativa (sindicato, colônia)", fund: "Art. 116, XXIX, da IN 128/2022" },
    { nome: "Ficha ou registro em hospitais ou postos de saúde", fund: "Art. 116, XXIV, da IN 128/2022" },
    { nome: "Licença de ocupação ou permissão outorgada pelo INCRA", fund: "Art. 106, X, da Lei 8.213/91; Art. 116, VIII, da IN 128/2022" },
    { nome: "Notas fiscais de entrada de mercadorias emitidas pela adquirente", fund: "Art. 106, VI, da Lei 8.213/91; Art. 116, IV, da IN 128/2022" },
    { nome: "Procuração", fund: "Art. 116, XIV, da IN 128/2022" },
    { nome: "Publicação na imprensa ou em informativos de circulação pública", fund: "Art. 116, XXXI, da IN 128/2022" },
    { nome: "Recibo de compra de implementos ou insumos agrícolas", fund: "Art. 116, XXVII, da IN 128/2022" },
    { nome: "Recibo de pagamento de contribuição federativa ou confederativa", fund: "Art. 116, XXII, da IN 128/2022" },
    { nome: "Recibos de contribuição social ao sindicato, colônia ou associação", fund: "Art. 116, XXX, da IN 128/2022" },
    { nome: "Registro em documentos de associações rurais/comunitárias", fund: "Art. 116, XXXIII, da IN 128/2022" },
    { nome: "Registro em livros de entidades religiosas (batismo, crisma, casamento)", fund: "Art. 116, XXXII, da IN 128/2022" },
    { nome: "Registro em processos judiciais (como testemunha, autor ou réu)", fund: "Art. 116, XXIII, da IN 128/2022" },
    { nome: "Registro Geral de Atividade Pesqueira (RGP) / SDPA", fund: "Art. 90, § 6º, II e III, da IN 128/2022" },
    { nome: "Título de aforamento", fund: "Art. 116, XXXIV, da IN 128/2022" },
    { nome: "Título de eleitor, ficha de cadastro eleitoral ou certidão eleitoral", fund: "Art. 116, XV, da IN 128/2022" },
    { nome: "Título de propriedade de imóvel rural", fund: "Art. 116, XXVI, da IN 128/2022" }
  ].sort((a, b) => a.nome.localeCompare(b.nome))
];

interface AnalysisPageProps {
  cliente: Client;
  onBack: () => void;
}

const parseLocal = (d: string) => new Date(`${d.split('T')[0]}T12:00:00`);

export function AnalysisPage({ cliente, onBack }: AnalysisPageProps) {
  const {
    loading, der, setDer, periodos, documentos,
    handleSavePeriod, handleRemovePeriod, handleSave,
  } = useBenefitAnalysis(cliente);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Periodo>>({
    tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocTitle: '', law: '', dataExpedicao: ''
  });

  const [docSearch, setDocSearch] = useState('');
  const [showDocList, setShowDocList] = useState(false);

  let docCounter = 1;
  const periodosTratados = [...periodos]
    .sort((a, b) => parseLocal(a.inicio).getTime() - parseLocal(b.inicio).getTime())
    .map(p => {
      const temProva = p.linkedDocTitle || p.tipo === 'prova de retorno';
      return { ...p, num: temProva ? docCounter++ : null };
    });

  const handleEditClick = (p: Periodo) => {
    setEditingId(p.id);
    setForm(p);
    setDocSearch(p.linkedDocTitle || '');
    document.getElementById('form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocTitle: '', law: '', dataExpedicao: '' });
    setDocSearch('');
  };

  const onSavePeriod = () => {
    handleSavePeriod(form, editingId);
    setEditingId(null);
    setForm({ tipo: 'rural', inicio: '', fim: '', obs: '', linkedDocTitle: '', law: '', dataExpedicao: '' });
    setDocSearch('');
  };

  const fmtDate = (d: string) => {
    if (!d) return '';
    const parts = d.split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const diffMonths = (d1: string, d2: string) => {
    if (!d1 || !d2) return 0;
    const date1 = parseLocal(d1);
    const date2 = parseLocal(d2);
    const months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()) + 1;
    return months > 0 ? months : 0;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${cliente.nome} - Linha do Tempo Rural`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b p-4 flex flex-col md:flex-row justify-between items-start md:items-center sticky top-0 z-10 shadow-sm gap-4 print:hidden">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
            <ArrowLeft className="text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Calculator className="text-slate-400" /> Calculadora Estratégica
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
              <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{cliente.nome}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center justify-center gap-2 transition flex-1 md:flex-none"
          >
            <FileDown size={16} /> Exportar PDF
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow flex items-center justify-center gap-2 disabled:opacity-50 flex-1 md:flex-none"
          >
            {loading ? 'Salvando...' : <><Save size={16} /> Salvar</>}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col md:flex-row print:overflow-visible">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:space-y-0 print:overflow-visible">
          
          <div className="grid grid-cols-1 gap-4 print:hidden">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <label className="text-xs font-bold text-slate-500 mb-1">Data do Requerimento (DER)</label>
              <input
                type="date"
                value={der}
                onChange={(e) => setDer(e.target.value)}
                className="w-full p-2 border rounded font-mono text-lg text-slate-700 bg-slate-50 focus:bg-white transition"
              />
            </div>
          </div>

          <StrategicTimeline der={der} periodos={periodosTratados} clienteNome={cliente.nome} />

          <div id="form-anchor" className={`p-6 rounded-2xl border shadow-sm transition-colors print:hidden ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold flex items-center gap-2 ${editingId ? 'text-amber-700' : 'text-slate-700'}`}>
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />} {editingId ? 'Editando Período' : 'Adicionar Período / Prova Legal'}
              </h3>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 px-3 py-1 rounded border border-slate-300 bg-white">
                  <X size={12} /> Cancelar
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-slate-500 block mb-1">Tipo de Período</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })} className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-amber-500 text-sm">
                  <option value="rural">🌾 Atividade Rural</option>
                  <option value="urbano">🏭 Urbano / CNIS</option>
                  <option value="beneficio">🏥 Benefício INSS</option>
                  <option value="lacuna">🕊️ Sem Atividade</option>
                  <option value="prova de retorno">📄 Prova de Retorno</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block mb-1">Início (Vínculo)</label>
                <input type="date" value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:border-amber-500 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block mb-1">Fim (Vínculo)</label>
                <input type="date" value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:border-amber-500 text-sm" />
              </div>
              <div className="md:col-span-5">
                <label className="text-xs font-bold text-slate-500 block mb-1">Observação / Referência</label>
                <input type="text" placeholder="Ex: Sítio São Judas, Safra de Café..." value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} className="w-full p-2.5 border rounded-lg outline-none focus:border-amber-500 text-sm" />
              </div>

              {/* SELEÇÃO DO DOCUMENTO + DATA DE EXPEDIÇÃO */}
              <div className="md:col-span-6 relative">
                <label className="text-xs font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <Search size={12}/> Documento de Prova Anexado
                </label>
                <input
                  type="text"
                  placeholder="Pesquise o nome do documento..."
                  value={docSearch}
                  onChange={(e) => {
                    setDocSearch(e.target.value);
                    setShowDocList(true);
                  }}
                  onFocus={() => setShowDocList(true)}
                  onBlur={() => setTimeout(() => setShowDocList(false), 200)} 
                  className="w-full p-2.5 border rounded-lg bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-medium text-slate-700"
                />
                
                {showDocList && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {DOCUMENTOS_LEGAIS
                      .filter(d => d.nome.toLowerCase().includes(docSearch.toLowerCase()))
                      .map((doc, i) => (
                      <div
                        key={i}
                        className="p-3 text-sm cursor-pointer hover:bg-amber-50 text-slate-700 border-b border-slate-100 last:border-0 transition-colors"
                        onClick={() => {
                          setForm({ ...form, linkedDocTitle: doc.nome === "Nenhum / Não informar" ? "" : doc.nome, law: doc.fund });
                          setDocSearch(doc.nome === "Nenhum / Não informar" ? "" : doc.nome);
                          setShowDocList(false);
                        }}
                      >
                        <div className="font-bold">{doc.nome}</div>
                        {doc.fund && <div className="text-[10px] text-slate-400 mt-0.5">{doc.fund}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATA DE EXPEDIÇÃO */}
              <div className="md:col-span-3">
                <label className="text-xs font-bold text-emerald-600 block mb-1">Data de Expedição (Doc)</label>
                <input 
                  type="date" 
                  value={form.dataExpedicao || ''} 
                  onChange={(e) => setForm({ ...form, dataExpedicao: e.target.value })} 
                  className="w-full p-2.5 border border-emerald-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm bg-emerald-50" 
                />
              </div>

              <div className="md:col-span-3">
                <button onClick={onSavePeriod} className={`w-full text-white p-2.5 rounded-lg font-bold text-sm transition flex justify-center gap-2 ${editingId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
                  {editingId ? <><Save size={16} /> Salvar</> : <><Plus size={16} /> Inserir</>}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 print:hidden">
            {periodosTratados.map((p) => {
              const meses = diffMonths(p.inicio, p.fim);
              let bgColor = 'bg-white', borderColor = 'border-slate-200', icon = <Calendar size={18} className="text-slate-400" />, statusText = '';
              
              if (p.tipo === 'rural') {
                bgColor = 'bg-emerald-50'; borderColor = 'border-emerald-200'; icon = <CheckCircle size={18} className="text-emerald-600" />; statusText = 'Conta como Carência Rural';
              } else if (p.tipo === 'urbano') {
                bgColor = 'bg-red-50'; borderColor = 'border-red-200'; icon = <XCircle size={18} className="text-red-600" />; statusText = 'Vínculo Urbano CNIS';
              } else if (p.tipo === 'beneficio') {
                bgColor = 'bg-amber-50'; borderColor = 'border-amber-200'; icon = <HelpCircle size={18} className="text-amber-600" />; statusText = 'Benefício Intercalado';
              } else if (p.tipo === 'lacuna') {
                bgColor = 'bg-slate-50'; borderColor = 'border-slate-200'; icon = <Calendar size={18} className="text-slate-400" />; statusText = 'Sem Atividade';
              } else if (p.tipo === 'prova de retorno') {
                bgColor = 'bg-blue-50'; borderColor = 'border-blue-200'; icon = <Paperclip size={18} className="text-blue-600" />; statusText = 'Prova de Retorno';
              }

              return (
                <div key={p.id} className={`p-4 rounded-xl border ${bgColor} ${borderColor} shadow-sm transition-all hover:shadow-md relative group`}>
                  <div className="flex justify-between items-start">
                    
                    <div className="flex items-start gap-4 w-full">
                      {p.num ? (
                        <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-sm">
                          {p.num}
                        </div>
                      ) : (
                        <div className="mt-1 shrink-0">{icon}</div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 uppercase text-sm tracking-wide">{p.tipo}</h4>
                        </div>
                        {meses > 0 && <p className="text-xs font-mono text-slate-500 mt-0.5">{meses} meses</p>}
                        <p className="text-sm text-slate-700 font-medium mt-1">
                          {fmtDate(p.inicio)} {p.fim ? `até ${fmtDate(p.fim)}` : ''}
                        </p>
                        
                        {p.obs && <p className="text-sm text-slate-800 font-bold mt-1.5">{p.obs}</p>}
                        
                        <div className="mt-2 text-xs font-bold text-slate-600 opacity-80">{statusText}</div>
                        
                        {p.linkedDocTitle && (
                          <div className="mt-3 bg-white/60 p-3 rounded-lg border border-blue-200/50 shadow-inner">
                            <p className="text-xs font-bold text-blue-800">
                              {p.linkedDocTitle}
                              {p.dataExpedicao && <span className="text-slate-500 font-normal ml-1">(Expedido em: {fmtDate(p.dataExpedicao)})</span>}
                            </p>
                            <p className="text-[10px] text-blue-600 mt-1 italic">{p.law}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button onClick={() => handleEditClick(p)} className="text-slate-400 hover:text-amber-500 p-2 rounded hover:bg-amber-50 transition" title="Editar"><Edit2 size={18} /></button>
                      <button onClick={() => handleRemovePeriod(p.id)} className="text-slate-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition" title="Remover"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}