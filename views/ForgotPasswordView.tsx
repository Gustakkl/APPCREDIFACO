
import React from 'react';

interface ForgotPasswordViewProps {
  onBack: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col p-8 items-center justify-center">
       <button onClick={onBack} className="absolute top-8 left-8 size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
         <span className="material-symbols-outlined">arrow_back</span>
       </button>

       <div className="flex flex-col items-center text-center max-w-xs">
          <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            <span className="material-symbols-outlined text-primary text-5xl">lock_reset</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-4">Esqueceu sua senha?</h1>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">Não se preocupe, digite seu e-mail e enviaremos um link de recuperação.</p>

          <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Link enviado!'); onBack(); }}>
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">E-mail</label>
              <input type="email" placeholder="seu@email.com" className="w-full h-14 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary" />
            </div>
            <button className="w-full h-14 bg-primary text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20">Enviar Link</button>
          </form>

          <button onClick={onBack} className="mt-8 text-slate-400 font-bold text-sm hover:text-primary transition-colors underline underline-offset-4 decoration-2">Voltar para o Login</button>
       </div>
    </div>
  );
};

export default ForgotPasswordView;
