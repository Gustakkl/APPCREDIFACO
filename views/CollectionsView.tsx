
import React, { useState, useMemo } from 'react';
import { Customer, Installment, User } from '../types';

interface CollectionsViewProps {
  customers: Customer[];
  stats: any;
  user: User | null;
  onMarkAsPaid: (customerId: string, installmentId: string) => void;
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ customers, stats, user, onMarkAsPaid }) => {
  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming'>('today');

  const todayStr = new Date().toLocaleDateString('pt-BR');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calculateFine = (amount: number, dueDateStr: string) => {
    const [d, m, y] = dueDateStr.split('/').map(Number);
    const dueDate = new Date(y, m - 1, d);
    if (dueDate >= today) return amount;
    const diffTime = Math.abs(today.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return amount * Math.pow(1 + 0.0158, diffDays);
  };

  const data = useMemo(() => {
    const overdue: { customer: Customer; inst: Installment }[] = [];
    const todayList: { customer: Customer; inst: Installment }[] = [];
    const upcoming: { customer: Customer; inst: Installment }[] = [];

    customers.forEach(c => {
      c.installments?.forEach(i => {
        if (i.status !== 'PAID') {
          const [d, m, y] = i.dueDate.split('/').map(Number);
          const dueDate = new Date(y, m - 1, d);
          if (i.dueDate === todayStr) todayList.push({ customer: c, inst: i });
          else if (dueDate < today) overdue.push({ customer: c, inst: i });
          else upcoming.push({ customer: c, inst: i });
        }
      });
    });
    return { overdue, todayList, upcoming };
  }, [customers, todayStr]);

  const currentList = activeTab === 'overdue' ? data.overdue : activeTab === 'today' ? data.todayList : data.upcoming;

  const handleIndividualCharge = (customer: Customer, inst: Installment) => {
    const pixKey = user?.pixKey || "Pendente de Cadastro";
    const totalWithFine = calculateFine(inst.amount, inst.dueDate);
    
    const message = `*AVISO DE COBRANÇA* 🏦\n\n` +
      `Olá, *${customer.name.split(' ')[0]}*!\n` +
      `Sua parcela *#${inst.number}* está aguardando liquidação.\n\n` +
      `*Valor:* R$ ${totalWithFine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `*Vencimento original:* ${inst.dueDate}\n\n` +
      `--- *CHAVE PIX PARA CÓPIA* ---\n\n` +
      `${pixKey}\n\n` +
      `--------------------------------\n\n` +
      `Por favor, envie o comprovante após o pagamento.`;

    window.open(`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col h-full bg-black text-white pb-24 md:pb-0 overflow-hidden font-display">
      <header className="p-8 md:p-12 pb-6 space-y-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter silver-text-gradient uppercase">Monitoramento de Ativos</h2>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-3">Aplicação Automática de Cláusulas de Atraso (1.58%)</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-10 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group font-black uppercase text-[10px] tracking-widest">
              <span className="material-symbols-outlined text-xl">file_download</span> Exportar
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 shadow-2xl space-y-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Liquidando Hoje</p>
            <p className="text-4xl font-black text-white tracking-tighter">R$ {(stats?.dueToday || 0).toLocaleString('pt-BR')}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 shadow-2xl space-y-3">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Inadimplência Bruta</p>
            <p className="text-4xl font-black text-[#f1b400] tracking-tighter">R$ {(stats?.overdueWithFines || 0).toLocaleString('pt-BR')}</p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 shadow-2xl space-y-3">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Fluxo Recuperado</p>
            <p className="text-4xl font-black text-white tracking-tighter">R$ {(stats?.paidToday || 0).toLocaleString('pt-BR')}</p>
          </div>
        </section>

        <div className="bg-[#0f0f0f] p-2 rounded-[32px] flex items-center gap-2 border border-white/5 max-w-2xl">
          {[
            { id: 'overdue', label: 'Atrasados', count: data.overdue.length, color: 'text-red-500' },
            { id: 'today', label: 'Hoje', count: data.todayList.length, color: 'text-white' },
            { id: 'upcoming', label: 'Projetados', count: data.upcoming.length, color: 'text-slate-500' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-2xl' : 'text-slate-600 hover:text-white'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest`}>{tab.label} <span className="ml-2 opacity-30">({tab.count})</span></span>
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-8 md:px-12 overflow-y-auto space-y-6 pb-20 no-scrollbar max-w-7xl mx-auto w-full">
        {currentList.length > 0 ? currentList.map(({ customer, inst }) => {
          const valWithFine = calculateFine(inst.amount, inst.dueDate);
          const fineAmount = valWithFine - inst.amount;

          return (
            <div key={`${customer.id}-${inst.id}`} className="bg-[#080808] p-8 md:p-10 rounded-[56px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-white/10 transition-all">
              <div className="flex items-center gap-8 w-full md:w-auto">
                <img src={customer.avatar} className="size-20 rounded-[32px] object-cover grayscale border-2 border-white/5 shadow-2xl group-hover:grayscale-0 transition-all duration-500" alt="" />
                <div>
                  <h4 className="font-black text-xl tracking-tighter group-hover:text-[#f1b400] transition-all uppercase">{customer.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[9px] font-black bg-white/5 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest border border-white/5">PARCELA {inst.number}</span>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">{inst.dueDate}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-10 w-full md:w-auto">
                <div className="text-right">
                  {fineAmount > 0 && (
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">+ Multa Operacional</p>
                  )}
                  <p className="text-3xl font-black text-white tracking-tighter">R$ {valWithFine.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                   <button 
                     onClick={() => handleIndividualCharge(customer, inst)}
                     className="size-14 bg-emerald-500 text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/10"
                     title="Cobrança Cópia e Cola"
                   >
                     <span className="material-symbols-outlined font-black">send_to_mobile</span>
                   </button>
                   <button onClick={() => onMarkAsPaid(customer.id, inst.id)} className="flex-1 md:flex-none px-10 h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                      Liquidar
                   </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-40 text-center flex flex-col items-center opacity-20">
            <span className="material-symbols-outlined text-8xl mb-8">shield_check</span>
            <p className="text-[11px] font-black uppercase tracking-[0.6em]">Fluxo Estabilizado • Sem Pendências</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CollectionsView;
