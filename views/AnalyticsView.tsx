
import React, { useMemo, useState } from 'react';
import { Customer, CustomerStatus, Transaction } from '../types';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

interface AnalyticsViewProps {
  stats: any;
  customers: Customer[];
  transactions: Transaction[];
}

type TimeRange = 'dia' | 'semana' | 'quinzenal' | 'mes';

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, customers, transactions }) => {
  const [activeReport, setActiveReport] = useState<'saude' | 'modalidades' | 'fluxo' | 'mensal'>('saude');
  const [timeRange, setTimeRange] = useState<TimeRange>('mes');

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const year = parts[2].length === 2 ? 2000 + Number(parts[2]) : Number(parts[2]);
      return new Date(year, Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date();
  };

  const monthlyReport = useMemo(() => {
    const reportMap: Record<string, { earnings: number, contracts: number, volume: number, dateObj: Date }> = {};

    transactions.forEach(t => {
      if (t.type === 'INCOME' && (t.category === 'PROFIT' || t.category === 'LOAN')) {
        const d = parseDate(t.date);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
        if (!reportMap[key]) reportMap[key] = { earnings: 0, contracts: 0, volume: 0, dateObj: new Date(d.getFullYear(), d.getMonth(), 1) };
        if (t.category === 'PROFIT') reportMap[key].earnings += t.amount;
      }
    });

    customers.forEach(c => {
      const d = parseDate(c.joinedDate);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (!reportMap[key]) reportMap[key] = { earnings: 0, contracts: 0, volume: 0, dateObj: new Date(d.getFullYear(), d.getMonth(), 1) };
      reportMap[key].contracts += 1;
      reportMap[key].volume += c.totalLoaned;
    });

    return Object.entries(reportMap)
      .map(([key, data]) => ({
        label: key,
        ...data,
        monthName: data.dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()
      }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [transactions, customers]);

  const modalityData = useMemo(() => {
    const modalities = ['Diário', 'Semanal', 'Quinzenal', 'Mensal'];
    return modalities.map(m => {
      const filtered = customers.filter(c => c.loanFrequency === m);
      return {
        subject: m,
        valor: filtered.reduce((acc, c) => acc + c.totalLoaned, 0),
        count: filtered.length,
        fullMark: Math.max(...modalities.map(x => customers.filter(c => c.loanFrequency === x).length)) || 10
      };
    });
  }, [customers]);

  const filteredTrend = useMemo(() => {
    const now = new Date();
    let days = 30;
    if (timeRange === 'dia') days = 1;
    if (timeRange === 'semana') days = 7;
    if (timeRange === 'quinzenal') days = 15;

    const dataMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      dataMap[d.toLocaleDateString('pt-BR')] = 0;
    }

    transactions.forEach(t => {
      if (t.type === 'INCOME' && dataMap[t.date] !== undefined) {
        dataMap[t.date] += t.amount;
      }
    });

    return Object.entries(dataMap)
      .map(([name, valor]) => ({ name: name.split('/')[0] + '/' + name.split('/')[1], valor }))
      .reverse();
  }, [transactions, timeRange]);

  return (
    <div className="flex flex-col flex-1 pb-32 overflow-y-auto bg-black text-white min-h-full font-display scroll-smooth no-scrollbar">
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-3xl border-b border-white/5 p-6 md:p-10 space-y-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter silver-text-gradient uppercase">Inteligência Operacional</h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-2">Dossiê Analítico e Histórico de Performance</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'saude', label: 'Saúde' },
              { id: 'modalidades', label: 'Modalidades' },
              { id: 'fluxo', label: 'Fluxo' },
              { id: 'mensal', label: 'Mensal' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveReport(tab.id as any)}
                className={`flex-1 min-w-[100px] px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeReport === tab.id ? 'bg-[#f1b400] text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeReport !== 'mensal' && (
          <div className="max-w-7xl mx-auto w-full flex bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
            {['dia', 'semana', 'quinzenal', 'mes'].map(r => (
              <button key={r} onClick={() => setTimeRange(r as TimeRange)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest ${timeRange === r ? 'bg-white text-black' : 'text-slate-600'}`}>
                {r === 'mes' ? '30 DIAS' : r === 'quinzenal' ? '15 DIAS' : r === 'semana' ? '7 DIAS' : 'HOJE'}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
        {activeReport === 'saude' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="bg-[#080808] p-8 rounded-[40px] border border-white/5 shadow-2xl group hover:border-[#f1b400]/30 transition-all">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Volume na Rua</p>
              <p className="text-3xl font-black text-white tracking-tighter">R$ {(stats?.totalOnStreet || 0).toLocaleString()}</p>
            </div>
            <div className="bg-[#080808] p-8 rounded-[40px] border border-white/5 shadow-2xl group hover:border-red-500/30 transition-all">
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Inadimplência</p>
              <p className="text-3xl font-black text-red-500 tracking-tighter">{((stats?.overdueCount || 0) / (customers.length || 1) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-[#080808] p-8 rounded-[40px] border border-white/5 shadow-2xl group hover:border-[#f1b400]/30 transition-all">
              <p className="text-[9px] font-black text-[#f1b400] uppercase tracking-widest mb-2">Ticket Médio</p>
              <p className="text-3xl font-black text-[#f1b400] tracking-tighter">R$ {((stats?.totalLoaned || 0) / (customers.length || 1)).toFixed(0).toLocaleString()}</p>
            </div>
            <div className="bg-[#080808] p-8 rounded-[40px] border border-white/5 shadow-2xl group hover:border-emerald-500/30 transition-all">
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Giro no Período</p>
              <p className="text-3xl font-black text-white tracking-tighter">R$ {(stats?.paidToday || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {activeReport === 'modalidades' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
            <div className="lg:col-span-6 bg-[#080808] p-10 rounded-[48px] border border-white/5 h-96">
               <h3 className="text-xs font-black uppercase text-slate-500 mb-8 tracking-widest">Peso por Modalidade</h3>
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={modalityData}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} />
                    <Radar name="Qtd Contratos" dataKey="count" stroke="#f1b400" fill="#f1b400" fillOpacity={0.6} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
               {modalityData.map(m => (
                 <div key={m.subject} className="bg-[#080808] p-8 rounded-[40px] border border-white/5 flex flex-col justify-between group hover:border-[#f1b400]/20 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.subject}</p>
                      <p className="text-3xl font-black text-white mt-2">{m.count} <span className="text-xs text-slate-700 font-black">ATIVOS</span></p>
                    </div>
                    <p className="text-sm font-black text-[#f1b400] mt-4">Vol: R$ {m.valor.toLocaleString()}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeReport === 'fluxo' && (
          <div className="bg-[#080808] p-10 rounded-[48px] border border-white/5 h-[500px] animate-in fade-in duration-500">
             <h3 className="text-xs font-black uppercase text-slate-500 mb-8 tracking-widest">Tendência de Recebimentos ({timeRange})</h3>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrend}>
                   <defs>
                     <linearGradient id="colFlow" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f1b400" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#f1b400" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#475569'}} />
                   <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '16px'}} />
                   <Area type="monotone" dataKey="valor" stroke="#f1b400" strokeWidth={4} fill="url(#colFlow)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        )}

        {activeReport === 'mensal' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-[#080808] p-10 rounded-[48px] border border-white/5">
                <h3 className="text-xs font-black uppercase text-slate-500 mb-10 tracking-[0.3em]">Fechamentos Mensais Detalhados</h3>
                <div className="space-y-4">
                   {monthlyReport.map((m, idx) => (
                      <div key={idx} className="bg-white/5 p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
                         <div className="space-y-2">
                            <p className="text-xl font-black text-white tracking-tighter uppercase">{m.monthName}</p>
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Período Fiscal Concluído</p>
                         </div>
                         
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full md:w-auto">
                            <div>
                               <p className="text-[9px] font-black text-[#f1b400] uppercase tracking-widest mb-1">Lucro Juros</p>
                               <p className="text-lg font-black text-white">R$ {(m.earnings || 0).toLocaleString()}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Novos Ativos</p>
                               <p className="text-lg font-black text-white">{m.contracts || 0} <span className="text-[8px] opacity-30">CONTRATOS</span></p>
                            </div>
                            <div className="hidden sm:block">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Alocação</p>
                               <p className="text-lg font-black text-white">R$ {(m.volume || 0).toLocaleString()}</p>
                            </div>
                         </div>

                         <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-700 group-hover:bg-[#f1b400] group-hover:text-black transition-all">
                            <span className="material-symbols-outlined text-xl">file_download</span>
                         </div>
                      </div>
                   ))}
                   {monthlyReport.length === 0 && (
                      <div className="py-20 text-center opacity-20">
                         <span className="material-symbols-outlined text-6xl">calendar_today</span>
                         <p className="text-[10px] font-black uppercase tracking-widest mt-4">Aguardando dados históricos</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsView;
