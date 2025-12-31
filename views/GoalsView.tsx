
import React, { useState } from 'react';
import { Goal } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  onUpdate: (goals: Goal[]) => void;
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', date: '' });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: Number(newGoal.target),
      currentAmount: 0,
      deadline: newGoal.date
    };
    onUpdate([...goals, goal]);
    setShowAdd(false);
    setNewGoal({ title: '', target: '', date: '' });
  };

  const updateAmount = (id: string, amount: number) => {
    onUpdate(goals.map(g => g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark pb-24 md:pb-0">
      <header className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black tracking-tight">Metas de Crescimento</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Foco e Disciplina Financeira</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="size-11 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined font-bold">add</span>
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-sm">{goal.title}</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Até {goal.deadline || 'Indefinido'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">{progress.toFixed(0)}%</p>
                </div>
              </div>

              <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atual / Meta</p>
                  <p className="text-sm font-black">R$ {goal.currentAmount.toLocaleString()} / <span className="text-slate-500">{goal.targetAmount.toLocaleString()}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateAmount(goal.id, 500)} className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {goals.length === 0 && !showAdd && (
          <div className="col-span-full py-24 text-center opacity-30">
            <span className="material-symbols-outlined text-6xl mb-4">flag</span>
            <p className="font-black uppercase tracking-widest text-xs">Nenhuma meta ativa. Comece agora!</p>
          </div>
        )}
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md p-8 rounded-[40px] border border-white/10">
            <h3 className="text-xl font-black mb-6">Nova Meta</h3>
            <div className="space-y-4">
              <input placeholder="Título (ex: Capital de Giro)" className="w-full h-14 px-6 bg-slate-100 dark:bg-white/5 rounded-2xl border-none font-bold" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              <input type="number" placeholder="Valor Alvo (R$)" className="w-full h-14 px-6 bg-slate-100 dark:bg-white/5 rounded-2xl border-none font-black" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} />
              <input type="date" className="w-full h-14 px-6 bg-slate-100 dark:bg-white/5 rounded-2xl border-none font-bold text-slate-500" value={newGoal.date} onChange={e => setNewGoal({...newGoal, date: e.target.value})} />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                <button onClick={addGoal} className="flex-[2] h-14 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Criar Meta</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsView;
