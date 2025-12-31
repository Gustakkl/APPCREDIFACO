
import React, { useState, useEffect, useMemo } from 'react';
import { Customer, CustomerStatus, Installment, CustomerDocument } from '../types';

interface AddCustomerViewProps {
  onBack: () => void;
  onSave: (customer: Customer) => void;
}

const AddCustomerView: React.FC<AddCustomerViewProps> = ({ onBack, onSave }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [calcMode, setCalcMode] = useState<'RATE' | 'INSTALLMENT'>('RATE');
  const [documents, setDocuments] = useState<CustomerDocument[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonePersonal: '',
    phoneBusiness: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    bairro: '',
    city: '',
    state: '',
    // Detalhes do Empréstimo
    loanAmount: 0,
    interestRate: 0,
    fixedInstallmentValue: 0,
    totalInstallments: 1,
    paidInstallments: 0,
    frequency: 'Mensal',
    loanDate: new Date().toISOString().split('T')[0],
    firstDueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    loanType: 'Pessoal',
    guarantee: ''
  });

  // Cálculo em tempo real
  const calculation = useMemo(() => {
    let totalToPay = 0;
    let installmentValue = 0;

    if (calcMode === 'RATE') {
      const interest = formData.loanAmount * (formData.interestRate / 100);
      totalToPay = formData.loanAmount + interest;
      installmentValue = formData.totalInstallments > 0 ? totalToPay / formData.totalInstallments : 0;
    } else {
      installmentValue = formData.fixedInstallmentValue;
      totalToPay = installmentValue * formData.totalInstallments;
    }

    const remainingInstallments = Math.max(0, formData.totalInstallments - formData.paidInstallments);
    const balanceDue = installmentValue * remainingInstallments;

    return { totalToPay, installmentValue, balanceDue };
  }, [calcMode, formData]);

  const checkCep = async (cep: string) => {
    const cleanCep = (cep || '').replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          street: data.logradouro,
          bairro: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
      }
    } catch (e) {
      console.error("Erro ao buscar CEP", e);
    } finally { 
      setLoadingCep(false); 
    }
  };

  const handleSave = () => {
    const installments: Installment[] = Array.from({ length: formData.totalInstallments || 1 }, (_, i) => {
      const isPaid = i < formData.paidInstallments;
      const d = new Date((formData.firstDueDate || new Date().toISOString().split('T')[0]) + 'T00:00:00');
      
      if (formData.frequency === 'Mensal') d.setMonth(d.getMonth() + i);
      else if (formData.frequency === 'Quinzenal') d.setDate(d.getDate() + (i * 15));
      else if (formData.frequency === 'Semanal') d.setDate(d.getDate() + (i * 7));
      else if (formData.frequency === 'Diário') d.setDate(d.getDate() + i);

      return {
        id: Math.random().toString(36).substr(2, 9),
        number: i + 1,
        dueDate: d.toLocaleDateString('pt-BR'),
        amount: calculation.installmentValue,
        status: isPaid ? 'PAID' : 'PENDING'
      };
    });

    const status = calculation.balanceDue <= 0 ? CustomerStatus.PAID : CustomerStatus.ACTIVE;

    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || 'Cliente Sem Nome',
      email: formData.email,
      cpf: formData.cpf || '000.000.000-00',
      phone: formData.phonePersonal || formData.phoneBusiness || 'Não informado',
      status: status,
      joinedDate: new Date(formData.loanDate || new Date()).toLocaleDateString('pt-BR'),
      totalLoaned: calculation.totalToPay,
      balanceDue: calculation.balanceDue,
      loanFrequency: formData.frequency,
      avatar: `https://picsum.photos/seed/${formData.name || Math.random()}/200`,
      documents: documents,
      address: {
        cep: formData.cep,
        street: formData.street,
        number: formData.number,
        bairro: formData.bairro,
        city: formData.city,
        state: formData.state
      },
      installments
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setDocuments(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: event.target?.result as string,
            type: file.type
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const inputClass = "w-full h-14 px-6 bg-[#080808] border border-white/10 rounded-2xl font-bold focus:border-[#f1b400]/50 focus:ring-1 focus:ring-[#f1b400]/20 transition-all outline-none text-white placeholder:text-slate-800 appearance-none";
  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 mb-2 block";

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-0 overflow-y-auto bg-black text-white font-display scroll-smooth no-scrollbar">
      <header className="sticky top-0 z-[60] flex items-center bg-black/95 backdrop-blur-md p-6 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-4 md:px-10">
          <button onClick={onBack} className="size-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="text-center flex-1 uppercase tracking-tighter">
            <h2 className="text-2xl font-black silver-text-gradient uppercase leading-none">Admissão de Ativo de Crédito</h2>
            <p className="text-[10px] font-black text-[#f1b400] tracking-[0.5em] uppercase mt-1">Terminal de Registro Oficial</p>
          </div>
          <div className="size-14 opacity-0"></div>
        </div>
      </header>

      <main className="p-6 md:p-12 max-w-[1600px] mx-auto w-full space-y-16">
        
        {/* IDENTIFICAÇÃO DO CLIENTE - GRID OTIMIZADO */}
        <section className="bg-[#080808] rounded-[56px] p-10 md:p-14 border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 bg-[#f1b400]/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="flex items-center gap-5 relative z-10 border-b border-white/5 pb-8">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#f1b400] border border-white/10">
               <span className="material-symbols-outlined text-3xl">person</span>
            </div>
            <h3 className="text-base font-black uppercase tracking-[0.4em]">Identificação Jurídica</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
            <div className="md:col-span-8">
              <label className={labelClass}>Nome Completo / Denominação Social</label>
              <input placeholder="Ex: João da Silva Santos" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="md:col-span-4">
              <label className={labelClass}>CPF / CNPJ</label>
              <input placeholder="000.000.000-00" className={inputClass} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
            </div>

            <div className="md:col-span-6">
              <label className={labelClass}>E-mail de Notificação</label>
              <input type="email" placeholder="email@exemplo.com" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>WhatsApp Pessoal</label>
              <input placeholder="(11) 98765-4321" className={inputClass} value={formData.phonePersonal} onChange={e => setFormData({...formData, phonePersonal: e.target.value})} />
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>WhatsApp Business</label>
              <input placeholder="(11) 98765-4321" className={inputClass} value={formData.phoneBusiness} onChange={e => setFormData({...formData, phoneBusiness: e.target.value})} />
            </div>
          </div>
        </section>

        {/* ENDEREÇO - GRID REFINADO PARA COMPUTADOR */}
        <section className="bg-[#080808] rounded-[56px] p-10 md:p-14 border border-white/5 shadow-2xl space-y-12">
          <div className="flex items-center gap-5 border-b border-white/5 pb-8">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#f1b400] border border-white/10">
               <span className="material-symbols-outlined text-3xl">location_on</span>
            </div>
            <h3 className="text-base font-black uppercase tracking-[0.4em]">Localização e Domicílio</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-3">
              <label className={labelClass}>CEP</label>
              <div className="relative">
                <input 
                  placeholder="00000-000" 
                  className={inputClass} 
                  value={formData.cep} 
                  onChange={e => { setFormData({...formData, cep: e.target.value}); checkCep(e.target.value); }} 
                />
                {loadingCep && <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-[#f1b400]">sync</span>}
              </div>
            </div>
            <div className="md:col-span-6">
              <label className={labelClass}>Logradouro</label>
              <input placeholder="Rua / Avenida" className={inputClass} value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Número</label>
              <input placeholder="Ex: 123" className={inputClass} value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
            </div>
            
            <div className="md:col-span-4">
              <label className={labelClass}>Bairro</label>
              <input placeholder="Ex: Centro" className={inputClass} value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
            </div>
            <div className="md:col-span-5">
              <label className={labelClass}>Cidade</label>
              <input placeholder="Ex: São Paulo" className={inputClass} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Estado (UF)</label>
              <input placeholder="Ex: SP" className={inputClass} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>
            
            <div className="md:col-span-12">
              <label className={labelClass}>Complemento e Referências</label>
              <input placeholder="Apto, Bloco, Casa, Próximo a..." className={inputClass} value={formData.complement} onChange={e => setFormData({...formData, complement: e.target.value})} />
            </div>
          </div>
        </section>

        {/* PARÂMETROS OPERACIONAIS - LARGURA TOTAL E INTERFACE DOURADA */}
        <section className="bg-[#080808] rounded-[56px] p-10 md:p-14 border border-white/5 shadow-2xl space-y-12">
          <div className="flex items-center gap-5 border-b border-white/5 pb-8">
            <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#f1b400] border border-white/10">
               <span className="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <h3 className="text-base font-black uppercase tracking-[0.4em]">Engenharia Financeira</h3>
          </div>

          <div className="bg-white/5 p-2 rounded-3xl flex gap-2 max-w-lg mb-4">
            <button 
              onClick={() => setCalcMode('RATE')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${calcMode === 'RATE' ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-white'}`}
            >
              Cálculo por Taxa (%)
            </button>
            <button 
              onClick={() => setCalcMode('INSTALLMENT')}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${calcMode === 'INSTALLMENT' ? 'bg-white text-black shadow-2xl' : 'text-slate-500 hover:text-white'}`}
            >
              Parcela Fixa (R$)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4 space-y-3">
              <label className={labelClass}>Capital Aportado (R$)</label>
              <input type="number" className="h-24 px-8 bg-white/5 rounded-[32px] border border-white/10 font-black text-4xl silver-text-gradient outline-none w-full" value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: Number(e.target.value)})} />
            </div>
            
            <div className="md:col-span-4 space-y-3">
              {calcMode === 'RATE' ? (
                <>
                  <label className={labelClass}>Taxa de Juros Efetiva (%)</label>
                  <input type="number" className="h-24 px-8 bg-white/5 rounded-[32px] border border-white/10 font-black text-4xl outline-none w-full" value={formData.interestRate} onChange={e => setFormData({...formData, interestRate: Number(e.target.value)})} />
                </>
              ) : (
                <>
                  <label className={labelClass}>Valor de Cada Parcela (R$)</label>
                  <input type="number" className="h-24 px-8 bg-white/5 rounded-[32px] border border-white/10 font-black text-4xl outline-none w-full" value={formData.fixedInstallmentValue} onChange={e => setFormData({...formData, fixedInstallmentValue: Number(e.target.value)})} />
                </>
              )}
            </div>

            <div className="md:col-span-4 space-y-3">
              <label className={labelClass}>Ciclos de Pagamento (Nº)</label>
              <input type="number" className="h-24 px-8 bg-white/5 rounded-[32px] border border-white/10 font-black text-4xl outline-none w-full" value={formData.totalInstallments} onChange={e => setFormData({...formData, totalInstallments: Number(e.target.value)})} />
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>Frequência de Liquidez</label>
              <div className="relative">
                <select className={inputClass} value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                  <option className="bg-[#080808]">Diário</option>
                  <option className="bg-[#080808]">Semanal</option>
                  <option className="bg-[#080808]">Quinzenal</option>
                  <option className="bg-[#080808]">Mensal</option>
                </select>
                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>Ciclos Amortizados</label>
              <input type="number" className={inputClass} value={formData.paidInstallments} onChange={e => setFormData({...formData, paidInstallments: Number(e.target.value)})} />
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>Data da Operação</label>
              <input type="date" className={inputClass} value={formData.loanDate} onChange={e => setFormData({...formData, loanDate: e.target.value})} />
            </div>

            <div className="md:col-span-3">
              <label className={labelClass}>Primeiro Vencimento</label>
              <input type="date" className={inputClass} value={formData.firstDueDate} onChange={e => setFormData({...formData, firstDueDate: e.target.value})} />
            </div>

            <div className="md:col-span-12">
              <label className={labelClass}>Garantias Reais e Alienações</label>
              <textarea 
                placeholder="Descreva detalhadamente os bens alienados, avalistas ou garantias adicionais..." 
                className="w-full h-40 p-8 bg-white/5 border border-white/10 rounded-[40px] font-bold focus:border-[#f1b400]/50 transition-all outline-none resize-none placeholder:text-slate-800"
                value={formData.guarantee}
                onChange={e => setFormData({...formData, guarantee: e.target.value})}
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 p-12 rounded-[56px] flex flex-col xl:flex-row justify-between items-center gap-12 mt-16">
            <div className="text-center xl:text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Valor Nominal da Parcela</p>
              <p className="text-5xl font-black text-white tracking-tighter leading-none">R$ {calculation.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-sm text-slate-700 font-bold uppercase ml-4">{formData.frequency}</span></p>
            </div>
            <div className="text-center xl:text-right">
              <p className="text-[10px] font-black text-[#f1b400] uppercase tracking-[0.4em] mb-3">Projeção de Recuperação Total</p>
              <p className="text-5xl font-black text-white tracking-tighter leading-none">R$ {calculation.balanceDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </section>

        <button 
          onClick={handleSave}
          className="w-full h-28 bg-[#f1b400] text-black rounded-[48px] font-black uppercase tracking-[0.6em] text-sm shadow-[0_30px_60px_rgba(241,180,0,0.2)] hover:scale-[1.01] active:scale-95 transition-all mb-24 flex items-center justify-center gap-6"
        >
          <span className="material-symbols-outlined font-black text-3xl">save</span>
          Efetivar e Gerar Contrato Oficial
        </button>
      </main>
    </div>
  );
};

export default AddCustomerView;
