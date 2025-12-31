
import React, { useState } from 'react';
import { Task } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onUpdate: (tasks: Task[]) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, onUpdate }) => {
  const [input, setInput] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onUpdate([...tasks, { id: Date.now().toString(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTask = (id: string) => {
    onUpdate(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    if(!confirm("Excluir esta tarefa?")) return;
    onUpdate(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-[#020202] pb-24 md:pb-0 overflow-y-auto no-scrollbar font-display">
      <header className="p-8 md:p-12 pb-4">
        <h2 className="text-3xl font-black tracking-tight silver-text-gradient uppercase">Tarefas Operacionais</h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Rotina de Gestão e Cobrança</p>
      </header>

      <form onSubmit={addTask} className="px-8 md:px-12 mb-8">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="DESCREVA A PRÓXIMA AÇÃO..." 
            className="w-full h-20 pl-8 pr-32 bg-white/5 rounded-[28px] border border-white/10 shadow-2xl font-black text-[11px] uppercase tracking-widest focus:ring-1 focus:ring-white/30 transition-all text-white outline-none placeholder:text-slate-700"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-3 bottom-3 px-8 bg-white text-black rounded-[20px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
            Adicionar
          </button>
        </div>
      </form>

      <div className="px-8 md:px-12 space-y-4 pb-20">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-6 p-6 bg-[#080808] rounded-[32px] border border-white/5 transition-all group hover:border-white/10">
            <button 
              onClick={() => toggleTask(task.id)} 
              className={`size-10 rounded-xl flex items-center justify-center border-2 transition-all ${task.completed ? 'bg-[#f1b400] border-[#f1b400] text-black' : 'border-slate-800 bg-black/40 text-transparent'}`}
            >
              <span className="material-symbols-outlined text-lg font-black">check</span>
            </button>
            <span className={`flex-1 font-black text-[11px] uppercase tracking-widest ${task.completed ? 'line-through text-slate-700' : 'text-slate-300'}`}>
              {task.text}
            </span>
            <button onClick={() => removeTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-3 text-slate-600 hover:text-red-500 bg-white/5 rounded-xl">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ))}
        
        {tasks.length === 0 && (
           <div className="py-24 text-center opacity-10 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl mb-6">checklist</span>
              <p className="font-black uppercase text-[10px] tracking-[0.5em]">Nenhuma pendência ativa</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
