
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';

interface SimulatorViewProps {
  onBack: () => void;
  customers: Customer[];
  onApply: (customerId: string, amount: number, months: number) => void;
}

const SimulatorView: React.FC<SimulatorViewProps> = ({ onBack, customers, onApply }) => {
  const [calcMode, setCalcMode] = useState<'RATE' | 'INSTALLMENT'>('RATE');
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(10.0);
  const [targetInstallment, setTargetInstallment] = useState(110);
  const [months, setMonths] = useState(10);
  const [frequency, setFrequency] = useState('Mensal');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const result = useMemo(() => {
    let total = 0;
    let installmentValue = 0;
    let effectiveRate = rate;

    if (calcMode === 'RATE') {
      const interest = amount * (rate / 100);
      total = amount + interest;
      installmentValue = total / months;
    } else {
      installmentValue = targetInstallment;
      total = installmentValue * months;
      effectiveRate = ((total - amount) / amount) * 100;
    }

    return { total, installmentValue, effectiveRate };
  }, [calcMode, amount, rate, targetInstallment, months]);

  const installmentPreview = Array.from({ length: months }, (_, i) => {
    const date = new Date();
    if (frequency === 'Mensal') date.setMonth(date.getMonth() + (i + 1));
    else if (frequency === 'Quinzenal') date.setDate(date.getDate() + ((i + 1) * 15));
    else if (frequency === 'Semanal') date.setDate(date.getDate() + ((i + 1) * 7));
    else date.setDate(date.getDate() + (i + 1));

    return {
      num: i + 1,
      date: date.toLocaleDateString('pt-BR'),
      val: result.installmentValue
    };
  });

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-8 overflow-y-auto bg-black text-white font-display scroll-smooth">
      <header className="sticky top-0 z-40 px-6 md:px-10 py-6 bg-black/80 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter silver-text-gradient uppercase">Simulador Estratégico</h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Cálculos Multi-Frequência de Rentabilidade</p>
        </div>
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-7xl mx-auto w-full">
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#0f0f0f] p-1.5 rounded-[32px] flex items-center gap-1 border border-white/5">
            <button onClick={() => setCalcMode('RATE')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${calcMode === 'RATE' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}>Por Taxa (%)</button>
            <button onClick={() => setCalcMode('INSTALLMENT')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${calcMode === 'INSTALLMENT' ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-white'}`}>Por Parcela (R$)</button>
          </div>

          <section className="bg-[#080808] rounded-[48px] p-10 border border-white/5 shadow-2xl space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Frequência da Operação</label>
              <div className="relative">
                <select className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest focus:ring-1 focus:ring-white/30 transition-all outline-none appearance-none" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  <option className="bg-[#080808]" value="Mensal">MENSAL</option>
                  <option className="bg-[#080808]" value="Quinzenal">QUINZENAL</option>
                  <option className="bg-[#080808]" value="Semanal">SEMANAL</option>
                  <option className="bg-[#080808]" value="Diário">DIÁRIO</option>
                </select>
                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Capital Bruto (Aporte)</label>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">R$</span>
                <input type="number" className="w-full h-20 pl-16 pr-8 bg-white/5 border border-white/10 rounded-3xl text-3xl font-black focus:ring-1 focus:ring-white/30 transition-all outline-none silver-text-gradient" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {calcMode === 'RATE' ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Taxa Total (%)</label>
                  <input type="number" className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-xl font-black outline-none focus:ring-1 focus:ring-white/30" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Valor Parcela (R$)</label>
                  <input type="number" className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-xl font-black outline-none focus:ring-1 focus:ring-white/30" value={targetInstallment} onChange={(e) => setTargetInstallment(Number(e.target.value))} />
                </div>
              )}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-1">Parcelas (Qtd)</label>
                <input type="number" className="w-full h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-xl font-black outline-none focus:ring-1 focus:ring-white/30" value={months} onChange={(e) => setMonths(Number(e.target.value))} />
              </div>
            </div>

            <button onClick={() => onBack()} className="w-full h-20 bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
              Fechar Simulador
            </button>
          </section>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white text-black p-10 rounded-[48px] shadow-2xl space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Parcela {frequency}</p>
                <p className="text-4xl font-black tracking-tighter">R$ {result.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[9px] font-bold uppercase opacity-30">Dividido em {months} parcelas</p>
              </div>
              <div className="bg-[#080808] p-10 rounded-[48px] border border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Taxa Efetiva</p>
                <p className="text-4xl font-black silver-text-gradient tracking-tighter">{result.effectiveRate.toFixed(2)}%</p>
                <p className="text-[9px] font-bold uppercase text-slate-700">Sobre o capital de R$ {amount.toLocaleString()}</p>
              </div>
           </div>

           <section className="bg-[#080808] rounded-[48px] p-10 border border-white/5">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Cronograma Previsto</h3>
             <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-3">
               {installmentPreview.map(p => (
                 <div key={p.num} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-white/20 transition-all">
                   <div className="flex items-center gap-6">
                     <span className="text-[10px] font-black text-slate-600">#{String(p.num).padStart(2, '0')}</span>
                     <p className="text-[11px] font-black uppercase tracking-widest">{p.date}</p>
                   </div>
                   <p className="text-sm font-black">R$ {p.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                 </div>
               ))}
             </div>
           </section>
        </div>
      </main>
    </div>
  );
};

export default SimulatorView;
