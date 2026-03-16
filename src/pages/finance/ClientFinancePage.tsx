import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wallet, TrendingUp, Calendar, CheckCircle, 
  Clock, Plus, Trash2, Target, DollarSign, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';
import { Client } from '../../types';

export function ClientFinancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [cliente, setCliente] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [tipoLancamento, setTipoLancamento] = useState<'a_vista' | 'parcelado' | 'estimativa'>('a_vista');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('2');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientRes, transRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).single(),
        supabase.from('transactions').select('*').eq('client_id', id).order('due_date', { ascending: true })
      ]);
      if (clientRes.data) setCliente(clientRes.data);
      if (transRes.data) setTransactions(transRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Se for estimativa, não exige a data de início
    if (!desc || !amount || (tipoLancamento !== 'estimativa' && !startDate)) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const totalAmount = parseFloat(amount.replace(',', '.'));
      let inserts = [];
      const recurrenceId = crypto.randomUUID();

      if (tipoLancamento === 'a_vista') {
        inserts.push({
          client_id: id, description: desc, amount: totalAmount, 
          type: 'entrada', status: 'pendente', due_date: startDate, category: 'Honorários'
        });
      } else if (tipoLancamento === 'estimativa') {
        inserts.push({
          client_id: id, description: `[Estimativa] ${desc}`, amount: totalAmount, 
          type: 'entrada', status: 'pendente', 
          due_date: new Date().toISOString().split('T')[0], // Data silenciosa para não quebrar o banco
          category: 'Estimativa'
        });
      } else if (tipoLancamento === 'parcelado') {
        const parcelas = parseInt(installments, 10);
        const valorParcela = totalAmount / parcelas;
        
        for (let i = 0; i < parcelas; i++) {
          const d = new Date(`${startDate}T12:00:00`);
          d.setMonth(d.getMonth() + i);
          
          inserts.push({
            client_id: id, 
            description: `${desc} (${i + 1}/${parcelas})`, 
            amount: valorParcela, 
            type: 'entrada', 
            status: 'pendente', 
            due_date: d.toISOString().split('T')[0], 
            category: 'Honorários',
            recurrence_id: recurrenceId
          });
        }
      }

      const { error } = await supabase.from('transactions').insert(inserts);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Lançamento financeiro criado.', variant: 'success' });
      setDesc(''); setAmount(''); setStartDate(''); setTipoLancamento('a_vista');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (transId: string, currentStatus: string) => {
    const novoStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    const paymentDate = novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null;

    try {
      const { error } = await supabase.from('transactions')
        .update({ status: novoStatus, payment_date: paymentDate })
        .eq('id', transId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      toast({ title: 'Erro', description: 'Não foi possível atualizar.', variant: 'destructive' });
    }
  };

  const handleDelete = async (transId: string) => {
    if(!confirm("Remover este lançamento?")) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', transId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' });
    }
  };

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR');

  const entradasReais = transactions.filter(t => t.category !== 'Estimativa');
  const estimativas = transactions.filter(t => t.category === 'Estimativa');

  const totalRecebido = entradasReais.filter(t => t.status === 'pago').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalPendente = entradasReais.filter(t => t.status === 'pendente').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalEstimado = estimativas.filter(t => t.status === 'pendente').reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 p-6 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(`/cliente/${id}`)} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Wallet className="text-emerald-600" /> Painel Financeiro do Cliente
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">{cliente?.nome || 'Carregando...'}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Já Recebido</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{fmtCurrency(totalRecebido)}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">A Receber (Ativo)</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{fmtCurrency(totalPendente)}</h3>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md border border-blue-500 flex items-center gap-4 text-white">
            <div className="p-4 bg-white/10 rounded-xl"><Target size={24} /></div>
            <div>
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wide">Estimativa (Potencial)</p>
              <h3 className="text-2xl font-black mt-1">{fmtCurrency(totalEstimado)}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULÁRIO DE LANÇAMENTO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Plus className="text-emerald-500" /> Nova Obrigação Financeira
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tipo de Acordo</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setTipoLancamento('a_vista')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${tipoLancamento === 'a_vista' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>À Vista</button>
                    <button onClick={() => setTipoLancamento('parcelado')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${tipoLancamento === 'parcelado' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Parcelado</button>
                    <button onClick={() => setTipoLancamento('estimativa')} className={`py-2 rounded-lg text-xs font-bold transition-all border ${tipoLancamento === 'estimativa' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Estimativa</button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Descrição</label>
                  <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder={tipoLancamento === 'estimativa' ? "Ex: RPV ou Precatório" : "Ex: Honorários Iniciais..."} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" />
                </div>

                <div className={`grid ${tipoLancamento === 'estimativa' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Valor Total (R$)</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" />
                  </div>
                  
                  {/* ESCONDE O VENCIMENTO SE FOR ESTIMATIVA */}
                  {tipoLancamento !== 'estimativa' && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Vencimento Inicial</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" />
                    </div>
                  )}
                </div>

                {tipoLancamento === 'parcelado' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Qtd. de Parcelas</label>
                    <input type="number" min="2" max="120" value={installments} onChange={e => setInstallments(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white text-sm font-medium transition-all" />
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">O valor total será dividido igualmente em {installments} meses a partir do vencimento inicial.</p>
                  </div>
                )}

                {tipoLancamento === 'estimativa' && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                    <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-800 font-medium">Estimativas dependem do êxito e não exigem data de vencimento. Elas não afetam o seu saldo, servem apenas para compor o seu "Potencial" no Fluxo de Caixa.</p>
                  </div>
                )}

                <button onClick={handleSave} disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-black shadow-lg shadow-slate-200 transition-all flex justify-center gap-2 items-center disabled:opacity-50">
                  {saving ? 'Lançando...' : <><DollarSign size={18}/> Salvar Lançamento</>}
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE LANÇAMENTOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Lançamentos Reais (Ativos) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" /> Contas e Honorários (Ativos)
              </h3>
              
              {entradasReais.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400">Nenhum honorário ativo lançado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entradasReais.map(t => (
                    <div key={t.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${t.status === 'pago' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => toggleStatus(t.id, t.status)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${t.status === 'pago' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-amber-500 text-transparent'}`}>
                          <CheckCircle size={14} />
                        </button>
                        <div>
                          <p className={`font-bold text-sm ${t.status === 'pago' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{t.description}</p>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mt-1">
                            <Calendar size={12} /> Venc: {fmtDate(t.due_date)}
                            {t.status === 'pago' && <span className="text-emerald-500 ml-2">• Recebido</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black ${t.status === 'pago' ? 'text-emerald-600 opacity-60' : 'text-amber-600'}`}>
                          {fmtCurrency(t.amount)}
                        </span>
                        <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Estimativas (Potencial) */}
            {estimativas.length > 0 && (
              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
                <h3 className="text-lg font-black text-blue-900 mb-6 flex items-center gap-2">
                  <Target className="text-blue-500" /> Potencial de Honorários (Estimativas)
                </h3>
                <div className="space-y-3">
                  {estimativas.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Target size={12} /></div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                          {/* TEXTO CORRIGIDO: Retirado o calendário */}
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-1">
                            <Target size={12} /> Valor sujeito a êxito na ação
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-blue-600">{fmtCurrency(t.amount)}</span>
                        <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}