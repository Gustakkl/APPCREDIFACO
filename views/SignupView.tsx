
import React, { useState } from 'react';

interface SignupViewProps {
  onBack: () => void;
  onSignup: (userData: { name: string, email: string, pass: string }) => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onBack, onSignup }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup({ name, email, pass: password });
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
       <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 mb-8">
         <span className="material-symbols-outlined">arrow_back</span>
       </button>

       <div className="flex flex-col mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-widest">CrediFácil</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Crie sua conta</h1>
          <p className="text-slate-500 mt-2 font-medium leading-relaxed">Gerencie empréstimos e controle sua saúde financeira com inteligência.</p>
       </div>

       <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Ex: João Silva" 
              className="w-full h-14 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary text-sm font-medium" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">E-mail Profissional</label>
            <input 
              type="email" 
              placeholder="nome@empresa.com" 
              className="w-full h-14 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary text-sm font-medium" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Crie uma Senha</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full h-14 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary text-sm font-medium" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full h-16 bg-primary text-black font-extrabold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all">
            Cadastrar
          </button>
       </form>

       <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-background-dark px-4 text-slate-400 font-bold uppercase tracking-widest">Ou continue com</span></div>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-10">
          <button className="h-14 flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-sm">
             <img src="https://www.google.com/favicon.ico" className="size-5 grayscale" alt="Google" />
             Google
          </button>
          <button className="h-14 flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-sm">
             <span className="material-symbols-outlined text-xl">apple</span>
             Apple
          </button>
       </div>
    </div>
  );
};

export default SignupView;
