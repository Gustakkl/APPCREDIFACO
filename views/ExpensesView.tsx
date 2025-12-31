
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExpensesViewProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ transactions, onAddTransaction }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ title: '', amount: '', category: 'OPERATIONAL' });

  const expenses = useMemo(() => 
    transactions.filter(t => t.type === 'EXPENSE' && t.category !== 'LOAN')
  , [transactions]);

  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);

  const chartData = useMemo(() => {
    const groups: any = {};
    expenses.forEach(e => {
      groups[e.category] = (groups[e.category] || 0) + e.amount;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#ffffff', '#64748b', '#cbd5e1', '#334155'];

  const handleAdd = () => {
    onAddTransaction({
      id: Date.now().toString(),
      type: 'EXPENSE',
      category: newExp.category as any,
      title: newExp.title || 'Despesa Sem Título',
      amount: Number(newExp.amount) || 0,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Custo Operacional'
    });
    setShowAdd(false);
    setNewExp({ title: '', amount: '', category: 'OPERATIONAL' });
  };

  return (
    <div className="flex flex-col h-full bg-black text-white pb-32 md:pb-0 overflow-hidden font-display">
      <header className="p-8 md:p-12 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter silver-text-gradient uppercase">Custos Operacionais</h2>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-2">Gestão de Drenagem de Capital</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-10 h-16 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
          Lançar Despesa
        </button>
      </header>

      <main className="flex-1 px-8 md:px-12 overflow-y-auto space-y-10 pb-12 no-scrollbar">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 bg-[#080808] rounded-[48px] p-10 border border-white/5 flex flex-col items-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Distribuição por Categoria</p>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="mt-8 space-y-2 w-full">
                {chartData.map((d, i) => (
                  <div key={i} className="flex justify-between items-center px-4">
                    <p className="text-[10px] font-black uppercase text-slate-500">{d.name}</p>
                    <p className="text-xs font-black">R$ {d.value.toLocaleString()}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="lg:col-span-8 bg-[#080808] rounded-[48px] p-10 border border-white/5 space-y-6 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest silver-text-gradient">Últimos Registros</h3>
                <p className="text-xl font-black">R$ {totalExpenses.toLocaleString()}</p>
             </div>
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
               {expenses.map(exp => (
                 <div key={exp.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                    <div>
                      <p className="text-sm font-black uppercase">{exp.title}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase mt-1">{exp.category} • {exp.date}</p>
                    </div>
                    <p className="text-lg font-black text-red-500">- R$ {exp.amount.toLocaleString()}</p>
                 </div>
               ))}
               {expenses.length === 0 && <div className="py-20 text-center opacity-20"><span className="material-symbols-outlined text-5xl">inventory_2</span><p className="text-[10px] font-black uppercase">Sem despesas</p></div>}
             </div>
          </div>
        </section>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-[#0a0a0a] w-full max-w-lg p-10 rounded-[48px] border border-white/10 space-y-8">
            <h3 className="text-2xl font-black silver-text-gradient text-center uppercase tracking-tighter">Novo Gasto</h3>
            <div className="space-y-4">
              <input placeholder="DESCRIÇÃO" className="w-full h-16 px-8 bg-white/5 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} />
              <input type="number" placeholder="VALOR (R$)" className="w-full h-16 px-8 bg-white/5 rounded-2xl border border-white/10 font-black text-2xl" value={newExp.amount} onChange={e => setNewExp({...newExp, amount: e.target.value})} />
              <div className="relative">
                <select className="w-full h-16 px-8 bg-white/5 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:border-white/30 transition-all" value={newExp.category} onChange={e => setNewExp({...newExp, category: e.target.value})}>
                  <option className="bg-[#080808]" value="OPERATIONAL">OPERACIONAL</option>
                  <option className="bg-[#080808]" value="RENT">ALUGUEL / ESPAÇO</option>
                  <option className="bg-[#080808]" value="MARKETING">MARKETING / ADS</option>
                  <option className="bg-[#080808]" value="ADJUST">OUTROS</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-16 bg-white/5 rounded-2xl font-black uppercase text-[10px]">Cancelar</button>
              <button onClick={handleAdd} className="flex-[2] h-16 bg-white text-black rounded-2xl font-black uppercase text-[10px] shadow-2xl">Lançar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
