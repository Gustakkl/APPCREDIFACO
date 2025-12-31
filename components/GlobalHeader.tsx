
import React, { useState } from 'react';
import { User, AppView, SystemAlert } from '../types';

interface GlobalHeaderProps {
  user: User | null;
  cashBalance: number;
  totalOnStreet: number;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
  notificationsCount: number;
  alerts: SystemAlert[];
  onSelectCustomerByName: (name: string) => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
  user, cashBalance, totalOnStreet, onViewChange, onLogout, notificationsCount, alerts, onSelectCustomerByName
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const displayName = user?.name || 'Gestor';
  const displayEmail = user?.email || 'Acesso Autorizado';
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleAlertClick = (customerName: string) => {
    onSelectCustomerByName(customerName);
    setIsNotifyOpen(false);
  };

  return (
    <header className="sticky top-0 z-[100] w-full h-16 md:h-20 bg-black/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-12">
      {/* Lado Esquerdo: Notificações e Logo Mobile */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative">
          <button 
            onClick={() => { setIsNotifyOpen(!isNotifyOpen); setIsMenuOpen(false); }}
            className="relative size-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
          >
            <span className={`material-symbols-outlined text-white text-2xl ${notificationsCount > 0 ? 'animate-swing' : ''}`}>notifications</span>
            {notificationsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-black min-w-[18px] flex items-center justify-center">
                {notificationsCount}
              </span>
            )}
          </button>

          {isNotifyOpen && (
            <>
              <div className="fixed inset-0 z-[-1]" onClick={() => setIsNotifyOpen(false)}></div>
              <div className="absolute top-full left-0 mt-3 w-80 md:w-96 bg-[#0c0c0c] border border-white/10 rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.8)] z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 card-silver-border">
                <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Alertas Operacionais</h3>
                  <span className="text-[9px] font-black bg-white/5 px-2 py-1 rounded text-slate-500">{notificationsCount} Pendentes</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  {alerts.length > 0 ? alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer" onClick={() => handleAlertClick(alert.customerName)}>
                      <p className="text-[10px] font-black text-white uppercase truncate">{alert.customerName}</p>
                      <p className="text-[9px] font-bold text-slate-500 mt-1">Vencimento: {alert.dueDate} • R$ {(alert.amount || 0).toLocaleString('pt-BR')}</p>
                    </div>
                  )) : (
                    <div className="py-10 text-center opacity-30 text-[9px] font-black uppercase tracking-widest text-slate-500">Sem alertas</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="md:hidden h-7">
           <img src="https://i.postimg.cc/jSLvWLXS/Whats-App-Image-2025-11-30-at-14-13-28-1-removebg-preview.png" className="h-full object-contain brightness-110" alt="Logo" />
        </div>
      </div>

      {/* Centro/Direita: Carteira, Lucro e Perfil */}
      <div className="flex items-center gap-3 md:gap-8">
        
        {/* Carteira (Saldo em Caixa) */}
        <div 
          onClick={() => onViewChange(AppView.WALLET)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="size-8 md:size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <span className="material-symbols-outlined text-lg md:text-xl silver-text-gradient group-hover:text-inherit">account_balance_wallet</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-[10px] md:text-xs font-black text-white whitespace-nowrap">
              R$ {(cashBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Caixa</span>
          </div>
        </div>

        {/* Lucro (Total na Rua) */}
        <div 
          onClick={() => onViewChange(AppView.ANALYTICS)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="size-8 md:size-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
            <span className="material-symbols-outlined text-lg md:text-xl text-emerald-500 group-hover:text-inherit">trending_up</span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-[10px] md:text-xs font-black text-white whitespace-nowrap">
              R$ {(totalOnStreet || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Ativos</span>
          </div>
        </div>

        {/* Perfil */}
        <div className="relative ml-2">
          <button 
            onClick={() => { setIsMenuOpen(!isMenuOpen); setIsNotifyOpen(false); }}
            className="size-9 md:size-11 rounded-full border-2 border-white/20 flex items-center justify-center bg-zinc-900 hover:border-white transition-all overflow-hidden shadow-lg card-silver-border"
          >
            {user?.avatar ? (
              <img src={user.avatar} className="size-full object-cover grayscale hover:grayscale-0 transition-all" alt="Perfil" />
            ) : (
              <span className="font-black text-white text-xs uppercase">{firstLetter}</span>
            )}
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute top-full right-0 mt-3 w-60 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 card-silver-border">
                <div className="px-5 py-4 border-b border-white/5 mb-1">
                  <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter">{displayName}</p>
                  <p className="text-[8px] font-bold text-slate-500 truncate">{displayEmail}</p>
                </div>
                <button onClick={() => { onViewChange(AppView.SETTINGS); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-300">
                  <span className="material-symbols-outlined text-base">settings</span> Ajustes
                </button>
                <div className="h-px bg-white/5 my-1"></div>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-red-500/10 text-[9px] font-black uppercase tracking-widest text-red-500">
                  <span className="material-symbols-outlined text-base">logout</span> Sair do Sistema
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
