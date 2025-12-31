
import React, { useMemo, useState } from 'react';
import { AppView, Transaction, SystemAlert, User, Customer, CustomerStatus } from '../types';
import AIInsights from '../components/AIInsights';

interface DashboardViewProps {
  onAction: (view: AppView) => void;
  stats: any;
  transactions: Transaction[];
  alerts: SystemAlert[];
  user: User | null;
  customers?: Customer[];
  dbStatus?: 'checking' | 'connected' | 'error';
}

const DashboardView: React.FC<DashboardViewProps> = ({ onAction, stats, transactions, alerts, user, customers = [], dbStatus }) => {
  const [search, setSearch] = useState('');

  const filteredSearch = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(term) || (c.cpf && c.cpf.includes(term))
    ).slice(0, 5);
  }, [search, customers]);

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-8 overflow-y-auto bg-black font-display scroll-smooth no-scrollbar">
      {/* Header Responsivo */}
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-12 pt-6 md:pt-10 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-1 md:space-y-2">
          <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">Central de Operações Inteligentes</p>
          <h2 className="text-2xl md:text-5xl font-black tracking-tighter silver-text-gradient uppercase leading-none">Visão do Gestor</h2>
        </div>
        
        <div className="relative group w-full lg:w-[400px] xl:w-[500px]">
          <span className="material-symbols-outlined absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-600">search</span>
          <input 
            placeholder="LOCALIZAR ATIVO..." 
            className="h-12 md:h-16 w-full pl-12 md:pl-14 pr-6 md:pr-8 bg-white/5 border border-white/10 rounded-xl md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] focus:ring-1 focus:ring-[#f1b400]/30 transition-all outline-none text-white placeholder:text-slate-700"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && filteredSearch.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-[#0d0d0d] border border-white/10 rounded-[20px] md:rounded-[24px] p-2 md:p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              {filteredSearch.map(c => (
                <button key={c.id} onClick={() => { onAction(AppView.CUSTOMERS); setSearch(''); }} className="w-full text-left p-3 md:p-4 hover:bg-white/5 rounded-xl transition-all flex items-center gap-3 md:gap-4">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center text-[#f1b400]">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] md:text-[11px] font-black uppercase text-white truncate">{c.name}</p>
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase">R$ {c.balanceDue.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="px-4 md:px-12 space-y-8 md:space-y-12 max-w-[1600px] mx-auto w-full pt-2 md:pt-4">
        {/* HUD - Grid Responsiva */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Exposição Ativa', val: stats?.totalOnStreet, sub: 'Capital alocado no mercado', icon: 'account_balance', color: 'text-white' },
            { label: 'Liquidez Recebida', val: stats?.totalPaid, sub: 'Volume Histórico Amortizado', icon: 'payments', color: 'text-white/80' },
            { label: 'Performance Estimada', val: stats?.profit, sub: 'Receita Operacional Acumulada', icon: 'trending_up', color: 'text-emerald-500' },
            { label: 'Taxa de Alerta', val: stats?.overdueCount, sub: 'Contratos em Atraso Crítico', icon: 'warning', color: 'text-red-500', isCount: true }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#080808] rounded-[24px] md:rounded-[48px] p-6 md:p-10 border border-white/5 shadow-2xl flex flex-col justify-between min-h-[140px] md:min-h-[220px] hover:border-white/15 transition-all relative overflow-hidden group">
               <div className="flex items-center gap-3 md:gap-5 relative z-10">
                 <div className="size-8 md:size-12 rounded-lg md:rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10"><span className="material-symbols-outlined text-lg md:text-2xl">{item.icon}</span></div>
                 <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500">{item.label}</p>
               </div>
               <div className="mt-4 md:mt-8 relative z-10">
                 <p className={`text-xl md:text-4xl font-black tracking-tighter ${item.color}`}>
                   {item.isCount ? item.val : `R$ ${(item.val || 0).toLocaleString('pt-BR')}`}
                 </p>
                 <p className="text-[7px] md:text-[9px] font-bold text-slate-700 uppercase tracking-widest mt-1 md:mt-2">{item.sub}</p>
               </div>
            </div>
          ))}
        </section>

        {/* Atalhos Estratégicos */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8">
          {[
            { view: AppView.CUSTOMERS, icon: 'group', label: 'Gestão Ativa', hover: 'hover:bg-white hover:text-black' },
            { view: AppView.COLLECTIONS, icon: 'contact_mail', label: 'Cobranças', hover: 'hover:bg-[#f1b400] hover:text-black' },
            { view: AppView.WALLET, icon: 'account_balance_wallet', label: 'Carteira Digital', hover: 'hover:bg-emerald-500 hover:text-black' },
            { view: AppView.EXPENSES, icon: 'payments', label: 'Despesas', hover: 'hover:bg-red-500 hover:text-white' }
          ].map((btn, i) => (
            <button key={i} onClick={() => onAction(btn.view)} className={`group bg-[#080808] border border-white/5 rounded-2xl md:rounded-[44px] p-4 md:p-10 flex flex-col gap-3 md:gap-6 items-center justify-center transition-all shadow-2xl ${btn.hover}`}>
               <div className="size-10 md:size-16 rounded-xl md:rounded-3xl bg-white/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                  <span className="material-symbols-outlined text-xl md:text-4xl group-hover:scale-110 transition-transform">{btn.icon}</span>
               </div>
               <h4 className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-center">{btn.label}</h4>
            </button>
          ))}
        </section>

        <div className="pb-10">
          <AIInsights data={stats} />
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
