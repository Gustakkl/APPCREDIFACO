
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';

interface WalletViewProps {
  transactions: Transaction[];
  balance: number;
  onAddTransaction: (tx: Transaction) => void;
  onResetWallet?: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({ transactions, balance, onAddTransaction, onResetWallet }) => {
  const [activeTab, setActiveTab] = useState<'LOAN' | 'PROFIT' | 'OPERATIONAL' | 'ADJUST'>('LOAN');
  const [showAdd, setShowAdd] = useState(false);
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'INCOME' as 'INCOME' | 'EXPENSE' });

  const summary = useMemo(() => {
    return {
      loan: transactions.filter(t => t.category === 'LOAN').reduce((acc, t) => {
        const val = Number(t.amount || 0);
        return t.type === 'INCOME' ? acc + val : acc - val;
      }, 0),
      profit: transactions.filter(t => t.category === 'PROFIT').reduce((acc, t) => acc + Number(t.amount || 0), 0),
      expense: transactions.filter(t => t.category === 'OPERATIONAL').reduce((acc, t) => acc + Number(t.amount || 0), 0),
      adjusts: transactions.filter(t => t.category === 'ADJUST').reduce((acc, t) => {
        const val = Number(t.amount || 0);
        return t.type === 'INCOME' ? acc + val : acc - val;
      }, 0),
    };
  }, [transactions]);

  const handleAddTx = () => {
    const amountVal = Number(newTx.amount);
    if (!newTx.title || isNaN(amountVal) || amountVal <= 0) {
      alert("Por favor, insira uma descrição e um valor válido.");
      return;
    }

    onAddTransaction({
      id: Date.now().toString(),
      type: newTx.type,
      category: activeTab as any,
      title: newTx.title,
      amount: amountVal,
      date: new Date().toLocaleDateString('pt-BR'),
      description: activeTab === 'ADJUST' ? 'Ajuste Manual de Saldo' : 'Operação de Tesouraria'
    });
    setShowAdd(false);
    setNewTx({ title: '', amount: '', type: 'INCOME' });
  };

  const tabs = [
    { key: 'LOAN', label: 'Em Mercado', val: summary.loan, icon: 'account_balance' },
    { key: 'PROFIT', label: 'Lucro Líquido', val: summary.profit, icon: 'trending_up' },
    { key: 'OPERATIONAL', label: 'Custo Oper.', val: summary.expense, icon: 'payments' },
    { key: 'ADJUST', label: 'Ajustes', val: summary.adjusts, icon: 'tune' },
  ];

  return (
    <div className="flex flex-col h-full bg-black text-white pb-32 md:pb-0 overflow-hidden font-display">
      <header className="p-8 md:p-12 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter silver-text-gradient uppercase leading-none">Tesouraria Central</h2>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-2">Monitoramento de Liquidez em Tempo Real</p>
        </div>
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 flex flex-col items-end shadow-2xl min-w-[240px] card-silver-border">
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Total Disponível</p>
          <p className="text-4xl font-black silver-text-gradient tracking-tighter">
            <span className="text-sm mr-2 opacity-30 font-medium">R$</span>
            {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto px-8 md:px-12 mb-10 no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`min-w-[180px] md:flex-1 p-8 rounded-[40px] border transition-all text-left relative overflow-hidden group ${activeTab === tab.key ? 'silver-bg-gradient text-black border-white shadow-2xl scale-105' : 'bg-[#080808] border-white/5 opacity-50'}`}
          >
            <div className={`size-10 rounded-xl mb-6 flex items-center justify-center ${activeTab === tab.key ? 'bg-black text-white shadow-xl' : 'bg-white/5 text-slate-700'}`}>
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            </div>
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === tab.key ? 'text-black/60' : 'text-slate-600'}`}>{tab.label}</p>
            <p className="text-lg font-black tracking-tight">R$ {tab.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </button>
        ))}
      </div>

      <main className="flex-1 px-8 md:px-12 overflow-y-auto space-y-6 pb-20 no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em]">Logs de Fluxo de Caixa</h3>
          <div className="flex gap-3">
            <button onClick={() => { setNewTx({title: 'Entrada de Capital', amount: '', type: 'INCOME'}); setShowAdd(true); }} className="px-6 h-12 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-xl hover:bg-white hover:text-black transition-all tracking-widest">Aporte</button>
            <button onClick={() => { setNewTx({title: 'Retirada de Saldo', amount: '', type: 'EXPENSE'}); setShowAdd(true); }} className="px-6 h-12 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-500 hover:text-white transition-all tracking-widest">Sangria</button>
          </div>
        </div>

        <div className="space-y-4">
          {transactions.filter(t => t.category === activeTab).map(tx => (
            <div key={tx.id} className="bg-[#080808] p-8 rounded-[44px] border border-white/5 flex justify-between items-center hover:border-white/15 transition-all group card-silver-border">
               <div className="flex items-center gap-6">
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${tx.type === 'INCOME' ? 'silver-bg-gradient text-black shadow-2xl' : 'bg-white/5 text-slate-800'}`}>
                    <span className="material-symbols-outlined text-xl font-bold">{tx.type === 'INCOME' ? 'add' : 'remove'}</span>
                  </div>
                  <div>
                     <p className="text-base font-black text-white uppercase tracking-tight">{tx.title}</p>
                     <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1">{tx.date} • {tx.description}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className={`text-2xl font-black ${tx.type === 'INCOME' ? 'text-white' : 'text-slate-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
               </div>
            </div>
          ))}
          {transactions.filter(t => t.category === activeTab).length === 0 && (
            <div className="py-24 text-center opacity-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl mb-4">database_off</span>
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma movimentação para esta categoria</p>
            </div>
          )}
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] w-full max-w-lg p-10 md:p-12 rounded-[56px] border border-white/10 space-y-10 shadow-2xl card-silver-border">
             <div className="text-center space-y-2">
               <h3 className="text-2xl font-black silver-text-gradient uppercase tracking-tighter">Lançamento em Tesouraria</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoria Selecionada: {activeTab}</p>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase ml-4">Descrição da Operação</label>
                   <input 
                     placeholder="EX: APORTE / AJUSTE DE CAIXA" 
                     className="w-full h-16 px-8 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-white/30 transition-all" 
                     value={newTx.title} 
                     onChange={e => setNewTx({...newTx, title: e.target.value})} 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase ml-4">Valor Nominal (R$)</label>
                   <div className="relative">
                     <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 font-black text-sm">R$</span>
                     <input 
                       type="number" 
                       placeholder="0,00" 
                       className="w-full h-24 px-16 bg-white/5 rounded-3xl border border-white/5 text-5xl font-black silver-text-gradient outline-none" 
                       value={newTx.amount} 
                       onChange={e => setNewTx({...newTx, amount: e.target.value})} 
                       autoFocus
                     />
                   </div>
                </div>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-16 bg-white/5 border border-white/10 text-slate-700 rounded-3xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button onClick={handleAddTx} className="flex-[2] h-16 silver-bg-gradient text-black rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Confirmar Operação</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
