
import React, { useState, useMemo } from 'react';
import { Customer, CustomerStatus } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onAdd: () => void;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, onSelect, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'Todos' | 'Ranking' | CustomerStatus>('Todos');

  const totals = useMemo(() => {
    return customers.reduce((acc, c) => {
      acc.totalLoaned += (c.totalLoaned || 0);
      acc.totalPaid += ((c.totalLoaned || 0) - (c.balanceDue || 0));
      acc.totalDue += (c.balanceDue || 0);
      return acc;
    }, { totalLoaned: 0, totalPaid: 0, totalDue: 0 });
  }, [customers]);

  const sortedAndFiltered = useMemo(() => {
    let result = [...customers];
    if (filter === 'Ranking') {
      result.sort((a, b) => b.totalLoaned - a.totalLoaned);
    } else if (filter !== 'Todos') {
      result = result.filter(c => c.status === filter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(term) || (c.cpf && c.cpf.includes(term)));
    }
    
    return result;
  }, [customers, filter, searchTerm]);

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-0 overflow-hidden font-display bg-black">
      <div className="bg-black/95 backdrop-blur-md pt-10 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 flex flex-col xl:flex-row items-end justify-between mb-10 gap-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black silver-text-gradient uppercase tracking-tighter leading-none">Carteira de Ativos</h2>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.5em] uppercase">Gestão Detalhada de Entidades Alocadas</p>
          </div>
          
          <button onClick={onAdd} className="h-16 px-10 rounded-[20px] bg-white text-black flex items-center gap-4 font-black text-[11px] uppercase shadow-2xl active:scale-95 transition-all w-full md:w-auto justify-center">
            <span className="material-symbols-outlined font-black">person_add</span> Cadastrar Novo Contrato
          </button>
        </div>

        {/* HUD Simétrico Expandido */}
        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 grid grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
           {[
             { label: 'Exposição Pendente', val: totals.totalDue, color: 'text-white' },
             { label: 'Liquidez Consolidada', val: totals.totalPaid, color: 'text-emerald-500' },
             { label: 'Patrimônio sob Gestão', val: totals.totalLoaned, color: 'text-white/60', hideMobile: true }
           ].map((t, idx) => (
             <div key={idx} className={`bg-white/5 border border-white/5 p-8 rounded-[40px] text-center group hover:border-white/15 transition-all ${t.hideMobile ? 'hidden lg:block' : ''}`}>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{t.label}</p>
                <p className={`text-2xl font-black ${t.color}`}>R$ {t.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>
           ))}
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-6 md:px-12 pb-10 space-y-8">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-slate-600">search</span>
            <input 
              type="text" 
              placeholder="PESQUISAR DENTRO DA CARTEIRA..." 
              className="w-full h-16 pl-16 pr-8 bg-white/5 border border-white/10 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] outline-none transition-all text-white placeholder:text-slate-800" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {['Todos', 'Ranking', ...Object.values(CustomerStatus)].map((f) => (
              <button 
                key={f} 
                onClick={() => setFilter(f as any)} 
                className={`whitespace-nowrap px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-slate-600 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 no-scrollbar max-w-[1600px] mx-auto w-full">
        {sortedAndFiltered.map((customer, index) => {
          const isRanking = filter === 'Ranking';
          const paidAmt = (customer.totalLoaned || 0) - (customer.balanceDue || 0);
          
          return (
            <div 
              key={customer.id} 
              onClick={() => onSelect(customer)} 
              className="group bg-[#080808] rounded-[48px] p-8 md:p-10 border border-white/5 transition-all cursor-pointer flex items-center gap-10 relative overflow-hidden hover:border-white/15 hover:bg-white/[0.01]"
            >
              <div className="flex items-center gap-10 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <img src={customer.avatar} className="size-24 rounded-[36px] border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 object-cover shadow-2xl" alt="" />
                  {isRanking && (
                    <div className="absolute -top-4 -right-4 size-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-[14px] border-4 border-black">#{index + 1}</div>
                  )}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                  <div className="md:col-span-4 min-w-0">
                    <h3 className="font-black text-xl tracking-tighter text-white uppercase truncate mb-2">{customer.name}</h3>
                    <div className="flex items-center gap-4">
                       <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${customer.status === CustomerStatus.OVERDUE ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-600'}`}>{customer.status}</span>
                       <p className="text-[10px] text-slate-800 font-black uppercase truncate tracking-widest">{customer.cpf}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 text-left md:text-right">
                    <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.2em] mb-2">Total Alocado</p>
                    <p className="text-lg font-black text-white">R$ {(customer.totalLoaned || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="md:col-span-2 text-left md:text-right">
                    <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.2em] mb-2">Liquidado</p>
                    <p className="text-lg font-black text-emerald-500">R$ {paidAmt.toLocaleString()}</p>
                  </div>

                  <div className="md:col-span-3 text-left md:text-right">
                    <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.2em] mb-2">Saldo Pendente</p>
                    <p className={`text-2xl font-black ${customer.balanceDue > 0 ? 'text-white' : 'text-slate-700'}`}>R$ {(customer.balanceDue || 0).toLocaleString()}</p>
                  </div>
                  
                  <div className="md:col-span-1 flex justify-end">
                    <span className="material-symbols-outlined text-slate-900 group-hover:text-white transition-all text-3xl">chevron_right</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomersView;
