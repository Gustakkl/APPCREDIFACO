
import React from 'react';
import { AppView, User } from '../types';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user: User | null;
  onLogout?: () => void;
  dbStatus?: 'checking' | 'connected' | 'error';
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, user, onLogout, dbStatus = 'checking' }) => {
  const navItems = [
    { label: 'Painel', view: AppView.DASHBOARD, icon: 'grid_view' },
    { label: 'Análises', view: AppView.ANALYTICS, icon: 'analytics' },
    { label: 'Clientes', view: AppView.CUSTOMERS, icon: 'group' },
    { label: 'Cobranças', view: AppView.COLLECTIONS, icon: 'account_balance' },
    { label: 'Carteira Digital', view: AppView.WALLET, icon: 'account_balance_wallet' },
    { label: 'Despesas', view: AppView.EXPENSES, icon: 'payments' },
    { label: 'Simulador', view: AppView.SIMULATOR, icon: 'calculate' },
    { label: 'Configurações', view: AppView.SETTINGS, icon: 'settings' },
  ];

  const handleTriggerLogout = () => {
    if (confirm('Encerrar sessão operacional?')) {
      onLogout?.();
    }
  };

  const logoUrl = "https://i.postimg.cc/jSLvWLXS/Whats-App-Image-2025-11-30-at-14-13-28-1-removebg-preview.png";

  return (
    <>
      {/* MOBILE BOTTOM BAR */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 backdrop-blur-2xl border-t border-white/10 z-[100] md:hidden flex items-center justify-around px-2 safe-bottom">
        {navItems.slice(0, 5).map((item, idx) => {
          const isActive = currentView === item.view || (item.view === AppView.CUSTOMERS && currentView === AppView.CUSTOMER_DETAILS);
          return (
            <button key={idx} onClick={() => onViewChange(item.view)} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'silver-text-gradient' : 'text-slate-500'}`}>
              <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>{item.icon}</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button onClick={() => onViewChange(AppView.SETTINGS)} className={`flex flex-col items-center gap-1 ${currentView === AppView.SETTINGS ? 'silver-text-gradient' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter">Mais</span>
        </button>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#050505] border-r border-white/5 shrink-0 overflow-y-auto no-scrollbar">
        <div className="p-10 mb-4 flex justify-center">
          <img src={logoUrl} alt="CREDIFACIL" className="h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
        </div>

        <div className="flex-1 px-4 space-y-1.5">
          {navItems.map((item, i) => {
            const isActive = currentView === item.view || (item.view === AppView.CUSTOMERS && (currentView === AppView.CUSTOMER_DETAILS || currentView === AppView.ADD_CUSTOMER));
            return (
              <button 
                key={i} 
                onClick={() => onViewChange(item.view)} 
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'silver-bg-gradient text-black shadow-[0_10px_20px_rgba(255,255,255,0.1)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="p-4 mt-auto">
          <button 
            onClick={handleTriggerLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all mb-4"
          >
            <span className="material-symbols-outlined text-2xl font-black">logout</span>
            <span className="text-sm font-bold">Sair</span>
          </button>

          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 card-silver-border">
             <div className="size-10 rounded-xl bg-gradient-to-br from-slate-800 to-black flex items-center justify-center border border-white/10 silver-text-gradient font-black">
               {user?.name?.charAt(0) || 'O'}
             </div>
             <div className="overflow-hidden">
               <p className="text-[10px] font-black truncate text-white uppercase tracking-wider">{user?.name || "Operador"}</p>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`size-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Sincronizado</p>
               </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
