
import React from 'react';
import { Customer, Installment } from '../types';

interface PaymentVoucherProps {
  customer: Customer;
  installment: Installment;
  onClose: () => void;
}

const PaymentVoucher: React.FC<PaymentVoucherProps> = ({ customer, installment, onClose }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-sm relative group">
        <div className="absolute -inset-1 bg-gradient-to-b from-white/20 to-transparent rounded-[48px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative bg-[#0a0a0a] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl flex flex-col items-center p-10 text-center space-y-8">
          <div className="size-20 bg-white text-black rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <span className="material-symbols-outlined text-4xl font-black">verified</span>
          </div>
          
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Comprovante de Operação</p>
            <h2 className="text-3xl font-black silver-text-gradient tracking-tighter uppercase">R$ {installment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2">Pagamento Confirmado</p>
          </div>

          <div className="w-full space-y-4 border-y border-white/5 py-8">
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black text-slate-600 uppercase">Beneficiário</span>
              <span className="text-[10px] font-black text-white uppercase">{customer.name}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black text-slate-600 uppercase">Parcela</span>
              <span className="text-[10px] font-black text-white uppercase">{installment.number} / {customer.installments?.length || 1}</span>
            </div>
            <div className="flex justify-between items-center px-2">
              <span className="text-[9px] font-black text-slate-600 uppercase">Data</span>
              <span className="text-[10px] font-black text-white uppercase">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button 
              onClick={() => {
                const text = `*COMPROVANTE CREDIFÁCIL*\n\nCliente: ${customer.name}\nValor: R$ ${installment.amount.toLocaleString()}\nStatus: Confirmado em ${new Date().toLocaleDateString('pt-BR')}\n\nObrigado pela pontualidade!`;
                window.open(`https://wa.me/55${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Enviar Comprovante
            </button>
            <button onClick={onClose} className="w-full h-14 bg-white/5 border border-white/10 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVoucher;
