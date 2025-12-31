
import React, { useState, useMemo } from 'react';
import { Customer, CustomerStatus, Transaction, User, Installment } from '../types';
import { jsPDF } from 'jspdf';

interface CustomerDetailsViewProps {
  customer: Customer | null;
  onBack: () => void;
  onPayInstallment: (customerId: string, installmentId: string, amount: number) => void;
  transactions: Transaction[];
  onDelete: () => void;
  onUpdate: (updated: Customer) => void;
  onClearHistory: (customerId: string) => void;
  onDeleteInstallment: (customerId: string, installmentId: string) => void;
  onQuitarTudo: (customerId: string) => void;
}

const CustomerDetailsView: React.FC<CustomerDetailsViewProps> = ({ 
  customer, onBack, onPayInstallment, transactions, onDelete, onUpdate,
  onClearHistory, onDeleteInstallment, onQuitarTudo
}) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'HISTORY' | 'NEW_LOAN'>('SCHEDULE');
  const [payingInstallment, setPayingInstallment] = useState<Installment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showGlobalActions, setShowGlobalActions] = useState(false);

  const customerHistory = useMemo(() => {
    return transactions
      .filter(t => t.customerId === customer?.id || t.description.includes(customer?.name || ''))
      .sort((a, b) => {
         const dateA = new Date(a.date.split('/').reverse().join('-')).getTime();
         const dateB = new Date(b.date.split('/').reverse().join('-')).getTime();
         return dateB - dateA;
      });
  }, [transactions, customer]);

  const handleWhatsAppBilling = (inst?: Installment) => {
    if (!customer) return;
    const phone = customer.phone.replace(/\D/g, '');
    let message = '';
    
    if (inst) {
      message = `Olá *${customer.name.split(' ')[0]}*,\nIdentificamos a parcela *#${inst.number}* pendente no valor de *R$ ${inst.amount.toLocaleString('pt-BR')}*.\n\nVencimento: ${inst.dueDate}\n\nPor favor, favorize o pagamento via PIX para regularizar.`;
    } else {
      message = `Olá *${customer.name.split(' ')[0]}*,\nEstamos atualizando sua ficha de crédito. O saldo total em aberto é de *R$ ${customer.balanceDue.toLocaleString('pt-BR')}*.\n\nComo podemos prosseguir com o acerto?`;
    }
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const startPayment = (inst: Installment, isPartial: boolean = false) => {
    setPayingInstallment(inst);
    setPaymentAmount(isPartial ? '' : inst.amount.toString());
  };

  const confirmPayment = () => {
    if (!customer || !payingInstallment) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    onPayInstallment(customer.id, payingInstallment.id, amount);
    setPayingInstallment(null);
  };

  if (!customer) return null;

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-0 overflow-y-auto bg-black text-white font-display scroll-smooth no-scrollbar">
      <header className="p-6 md:p-10 bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={onBack} className="size-10 md:size-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">
              <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg md:text-3xl font-black silver-text-gradient uppercase tracking-tighter leading-none truncate max-w-[180px] md:max-w-none">{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded ${customer.status === CustomerStatus.OVERDUE ? 'bg-red-500' : 'bg-emerald-500'} text-white`}>{customer.status}</span>
                <p className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-widest hidden xs:block">{customer.cpf}</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowGlobalActions(!showGlobalActions)}
              className="h-10 md:h-14 px-4 md:px-8 silver-bg-gradient text-black rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-3 shadow-xl active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">settings_applications</span>
              <span className="hidden sm:inline">Ações do Ativo</span>
            </button>

            {showGlobalActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowGlobalActions(false)}></div>
                <div className="absolute top-full right-0 mt-3 w-64 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-150 overflow-hidden card-silver-border">
                  <button onClick={() => { onQuitarTudo(customer.id); setShowGlobalActions(false); }} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 text-slate-300 transition-all">
                    <span className="material-symbols-outlined text-lg">done_all</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Quitar Tudo</span>
                  </button>
                  <button onClick={() => { handleWhatsAppBilling(); setShowGlobalActions(false); }} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-emerald-500/10 text-emerald-500 transition-all">
                    <span className="material-symbols-outlined text-lg">chat</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Cobrar Global</span>
                  </button>
                  <button onClick={() => { if(confirm('Apagar todo o histórico de pagamentos deste ativo?')) onClearHistory(customer.id); setShowGlobalActions(false); }} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 text-slate-300 transition-all">
                    <span className="material-symbols-outlined text-lg">history_toggle_off</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Limpar Histórico</span>
                  </button>
                  <div className="h-px bg-white/5 my-1"></div>
                  <button onClick={() => { if(confirm('EXCLUIR DEFINITIVAMENTE este registro?')) onDelete(); }} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-500/10 text-red-500 transition-all">
                    <span className="material-symbols-outlined text-lg">delete_forever</span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Excluir Ativo</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 max-w-[1400px] mx-auto w-full pt-8">
        <aside className="lg:col-span-4 space-y-6">
           <section className="bg-[#080808] rounded-[40px] p-8 border border-white/5 shadow-2xl flex flex-col items-center card-silver-border">
              <div className="relative mb-6">
                <img src={customer.avatar} className="size-24 md:size-40 rounded-[32px] md:rounded-[40px] grayscale object-cover border-4 border-white/5 shadow-2xl" alt="" />
                <div className="absolute -bottom-2 -right-2 size-8 md:size-10 bg-emerald-500 rounded-2xl border-4 border-[#080808] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs md:text-sm text-black font-black">verified</span>
                </div>
              </div>
              <div className="text-center mb-6 space-y-1">
                <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-600 tracking-widest">Exposição Pendente</p>
                <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">R$ {customer.balanceDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <button onClick={() => setActiveTab('NEW_LOAN')} className="w-full h-14 silver-bg-gradient text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl">
                 <span className="material-symbols-outlined text-lg">add_card</span> Novo Ciclo
              </button>
           </section>

           <div className="bg-[#080808] rounded-[32px] p-6 border border-white/5 space-y-4 card-silver-border">
              <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Base de Dados</h4>
              <div className="space-y-3">
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Telefone</span>
                    <span className="text-[10px] font-black">{customer.phone || 'N/A'}</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Adesão</span>
                    <span className="text-[10px] font-black">{customer.joinedDate}</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Total Alocado</span>
                    <span className="text-[10px] font-black">R$ {customer.totalLoaned.toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </aside>

        <section className="lg:col-span-8 space-y-6">
           <div className="flex bg-[#080808] p-1.5 rounded-[24px] md:rounded-[32px] border border-white/5 overflow-x-auto no-scrollbar card-silver-border">
              {[
                { id: 'SCHEDULE', label: 'Cronograma', icon: 'payments' },
                { id: 'HISTORY', label: 'Histórico', icon: 'history' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex-1 flex items-center justify-center gap-3 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'silver-bg-gradient text-black shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
                >
                  <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="space-y-4 min-h-[400px]">
              {activeTab === 'SCHEDULE' && (
                customer.installments?.map((i) => (
                  <div key={i.id} className={`p-6 md:p-8 rounded-[32px] md:rounded-[40px] border flex flex-col sm:flex-row items-center justify-between gap-6 transition-all group ${i.status === 'PAID' ? 'bg-white/5 border-white/5 opacity-40' : 'bg-[#080808] border-white/10 card-silver-border'}`}>
                    <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                       <div className={`size-12 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl ${i.status === 'PAID' ? 'silver-bg-gradient text-black' : 'bg-white/5 text-slate-500'}`}>{i.number}</div>
                       <div className="flex-1">
                          <p className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Vencimento: {i.dueDate}</p>
                          <p className="text-xl md:text-2xl font-black tracking-tighter">R$ {i.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          {i.status === 'PARTIAL' && <span className="text-[7px] font-black bg-orange-500 text-white px-2 py-0.5 rounded uppercase mt-1 inline-block shadow-sm">Liquidação Parcial</span>}
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                      {i.status !== 'PAID' ? (
                        <>
                          <button onClick={() => startPayment(i, false)} className="flex-1 sm:flex-none px-4 h-12 silver-bg-gradient text-black rounded-xl font-black uppercase text-[8px] tracking-widest shadow-xl active:scale-95 transition-all">
                            Liquidar
                          </button>
                          <button onClick={() => startPayment(i, true)} className="size-12 bg-white/5 border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all" title="Baixa Parcial">
                             <span className="material-symbols-outlined text-lg font-black">edit_note</span>
                          </button>
                          <button onClick={() => handleWhatsAppBilling(i)} className="size-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all">
                             <span className="material-symbols-outlined text-lg">chat</span>
                          </button>
                          <button onClick={() => { if(confirm('Remover esta parcela do contrato?')) onDeleteInstallment(customer.id, i.id); }} className="size-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                             <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </>
                      ) : (
                        <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {activeTab === 'HISTORY' && (
                <div className="space-y-3">
                  {customerHistory.length > 0 ? customerHistory.map(tx => (
                    <div key={tx.id} className="bg-[#080808] p-5 rounded-[24px] border border-white/5 flex justify-between items-center hover:border-white/20 transition-all card-silver-border">
                       <div className="flex items-center gap-4">
                          <div className={`size-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'silver-bg-gradient text-black shadow-lg' : 'bg-white/5 text-slate-600'}`}>
                             <span className="material-symbols-outlined text-lg">{tx.type === 'INCOME' ? 'receipt_long' : 'payments'}</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-tight">{tx.title}</p>
                             <p className="text-[8px] font-bold text-slate-600 uppercase mt-0.5">{tx.date} • {tx.description}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-base font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                       </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                       <span className="material-symbols-outlined text-5xl mb-4">history_toggle_off</span>
                       <p className="text-[9px] font-black uppercase tracking-widest">Sem movimentação financeira</p>
                    </div>
                  )}
                </div>
              )}
           </div>
        </section>
      </main>

      {payingInstallment && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-[#0c0c0c] w-full max-w-md p-8 md:p-10 rounded-[32px] md:rounded-[48px] border border-white/10 space-y-8 shadow-2xl card-silver-border">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-black silver-text-gradient uppercase tracking-tighter">Confirmação de Recebimento</h3>
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Parcela #{payingInstallment.number} • {customer.name}</p>
              </div>
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-600 uppercase ml-4">Valor Efetivado (R$)</label>
                 <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 font-black text-lg">R$</span>
                    <input 
                       type="number" 
                       className="w-full h-16 md:h-20 pl-14 md:pl-16 pr-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-2xl md:text-3xl font-black text-white outline-none focus:border-white/30 transition-all"
                       value={paymentAmount}
                       onChange={e => setPaymentAmount(e.target.value)}
                       autoFocus
                    />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setPayingInstallment(null)} className="flex-1 h-14 bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[9px] tracking-widest">Cancelar</button>
                 <button onClick={confirmPayment} className="flex-[2] h-14 silver-bg-gradient text-black rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-xl active:scale-95 transition-all">Confirmar Baixa</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsView;
