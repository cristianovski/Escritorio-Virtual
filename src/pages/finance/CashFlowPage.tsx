import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Target, 
  Calendar, CheckCircle, Plus, Trash2, Clock,
  ChevronLeft, ChevronRight, RefreshCw, Briefcase
} from 'lucide-react';
// CORREÇÃO: Voltando duas pastas para achar o lib e hooks
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/use-toast';

export function CashFlowPage() {
  const { toast } = useToast();
  
  // Controle de Tempo
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dados
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State Geral (Escritório)
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'entrada' | 'saida'>('saida');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('12');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Puxa as transações do escritório E as que foram lançadas lá na ficha do cliente!
      const { data, error } = await supabase.from('transactions').select(`*, clients ( nome )`).order('due_date', { ascending: true });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({ title: 'Erro', description: 'Falha ao carregar fluxo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!desc || !amount || !dueDate) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const totalAmount = parseFloat(amount.replace(',', '.'));
      let inserts = [];
      const recurrenceId = crypto.randomUUID();

      if (isRecurring) {
        const months = parseInt(recurringMonths, 10);
        for (let i = 0; i < months; i++) {
          const d = new Date(`${dueDate}T12:00:00`);
          d.setMonth(d.getMonth() + i);
          inserts.push({
            description: `${desc} (${i + 1}/${months})`, 
            amount: totalAmount, type, status: 'pendente', 
            due_date: d.toISOString().split('T')[0], 
            category: type === 'saida' ? 'Custo Fixo' : 'Receita Geral',
            recurrence_id: recurrenceId
          });
        }
      } else {
        inserts.push({
          description: desc, amount: totalAmount, type, status: 'pendente', 
          due_date: dueDate, category: type === 'saida' ? 'Despesa' : 'Receita Geral'
        });
      }

      const { error } = await supabase.from('transactions').insert(inserts);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Lançamento salvo com sucesso.', variant: 'success' });
      setDesc(''); setAmount(''); setDueDate(''); setIsRecurring(false);
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
      const { error } = await supabase.from('transactions').update({ status: novoStatus, payment_date: paymentDate }).eq('id', transId);
      if (error) throw error;
      fetchData();
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' });
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

  // Navegação do Mês
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const currentMonthNum = currentDate.getMonth();
  const currentYearNum = currentDate.getFullYear();

  // Filtros de Transações
  // 1. O Pipeline Global (Potencial de Honorários de TODOS os meses)
  const totalPotencial = transactions
    .filter(t => t.category === 'Estimativa' && t.status === 'pendente')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 2. Transações do Mês Atual (Ignorando Estimativas que não são caixa real)
  const transacoesMes = transactions.filter(t => {
    if (t.category === 'Estimativa') return false;
    const d = new Date(`${t.due_date}T12:00:00`);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
  });

  const entradasMes = transacoesMes.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const saidasMes = transacoesMes.filter(t => t.type === 'saida').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const saldoMes = entradasMes - saidasMes;

  const fmtCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      
      {/* HEADER E NAVEGAÇÃO DE MÊS */}
      <header className="bg-white border-b border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <DollarSign className="text-emerald-600" /> Fluxo de Caixa Central
        </h1>
        
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-inner">
          <button onClick={prevMonth} className="p-2 hover:bg-white rounded-lg transition shadow-sm"><ChevronLeft size={20}/></button>
          <span className="font-black text-slate-700 w-40 text-center uppercase tracking-wider text-sm">
            {monthName}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-white rounded-lg transition shadow-sm"><ChevronRight size={20}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* CARDS DE SAÚDE FINANCEIRA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
            <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wide flex items-center gap-1.5 mb-1"><TrendingUp size={14}/> Entradas do Mês</p>
            <h3 className="text-2xl font-black text-emerald-600">{fmtCurrency(entradasMes)}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100">
            <p className="text-xs font-bold text-rose-600/70 uppercase tracking-wide flex items-center gap-1.5 mb-1"><TrendingDown size={14}/> Saídas do Mês</p>
            <h3 className="text-2xl font-black text-rose-600">{fmtCurrency(saidasMes)}</h3>
          </div>
          <div className={`p-5 rounded-2xl shadow-sm border ${saldoMes >= 0 ? 'bg-slate-900 border-slate-800 text-white' : 'bg-red-900 border-red-800 text-white'}`}>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1"><DollarSign size={14}/> Saldo Projetado</p>
            <h3 className="text-2xl font-black">{fmtCurrency(saldoMes)}</h3>
          </div>
          
          {/* DESTAQUE: POTENCIAL DE HONORÁRIOS (ESTIMATIVAS) */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-2xl shadow-md border border-blue-500 text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform"><Target size={100}/></div>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-wide flex items-center gap-1.5 mb-1 relative z-10"><Target size={14}/> Potencial de Honorários (Geral)</p>
            <h3 className="text-2xl font-black relative z-10">{fmtCurrency(totalPotencial)}</h3>
            <p className="text-[10px] text-blue-200 mt-1 relative z-10">Soma de todas estimativas pendentes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULÁRIO DE LANÇAMENTO DO ESCRITÓRIO */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Plus className="text-slate-500" /> Lançamento do Escritório
              </h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <button onClick={() => setType('entrada')} className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'entrada' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Entrada</button>
                  <button onClick={() => setType('saida')} className={`py-2 rounded-lg text-xs font-bold transition-all ${type === 'saida' ? 'bg-rose-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>Saída</button>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Descrição</label>
                  <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Aluguel, Sistema, Internet..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-500 focus:bg-white text-sm font-medium transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-500 focus:bg-white text-sm font-medium transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Data</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-500 focus:bg-white text-sm font-medium transition-all" />
                  </div>
                </div>

                {/* RECORRÊNCIA (DESPESAS FIXAS) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer mb-3">
                    <input type="checkbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4 accent-slate-800" />
                    <RefreshCw size={14} className="text-slate-400"/> Repetir Lançamento
                  </label>
                  
                  {isRecurring && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Por quantos meses?</label>
                      <input type="number" min="2" max="60" value={recurringMonths} onChange={e => setRecurringMonths(e.target.value)} className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-slate-500 text-sm font-medium" />
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-tight">Ideal para Aluguel, Internet e Assinaturas. O sistema criará as cópias nos meses futuros.</p>
                    </div>
                  )}
                </div>

                <button onClick={handleSave} disabled={saving} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl font-black shadow-lg shadow-slate-200 transition-all flex justify-center gap-2 items-center disabled:opacity-50">
                  {saving ? 'Lançando...' : <><Plus size={18}/> Salvar no Caixa</>}
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE TRANSAÇÕES DO MÊS */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-slate-400" /> Movimentações de {monthName.split(' ')[0]}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-10"><Clock className="animate-spin text-slate-300" size={32}/></div>
              ) : transacoesMes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-400">Nenhuma movimentação lançada neste mês.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transacoesMes.map(t => {
                    const isEntrada = t.type === 'entrada';
                    const color = isEntrada ? 'emerald' : 'rose';
                    const isPago = t.status === 'pago';
                    
                    return (
                      <div key={t.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${isPago ? `bg-${color}-50/50 border-${color}-100` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-start sm:items-center gap-4">
                          <button onClick={() => toggleStatus(t.id, t.status)} className={`mt-1 sm:mt-0 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isPago ? `bg-${color}-500 border-${color}-500 text-white` : `border-slate-300 hover:border-${color}-500 text-transparent`}`}>
                            <CheckCircle size={14} />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-sm ${isPago ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{t.description}</p>
                              {/* CORREÇÃO AQUI: Span por volta do ícone para abrigar o title */}
                              {t.recurrence_id && <span title="Despesa Recorrente"><RefreshCw size={10} className="text-slate-400" /></span>}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold mt-1">
                              <span className={`px-2 py-0.5 rounded uppercase tracking-wider ${isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {t.type}
                              </span>
                              {t.clients && (
                                <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  <Briefcase size={10}/> {t.clients.nome}
                                </span>
                              )}
                              <span className="text-slate-400 flex items-center gap-1">
                                <Calendar size={10} /> {new Date(`${t.due_date}T12:00:00`).toLocaleDateString('pt-BR').substring(0,5)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start gap-4">
                          <span className={`font-black ${isPago ? `text-${color}-600 opacity-60` : `text-${color}-600`}`}>
                            {isEntrada ? '+' : '-'} {fmtCurrency(t.amount)}
                          </span>
                          <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}