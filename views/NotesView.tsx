
import React, { useState } from 'react';
import { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  onUpdate: (notes: Note[]) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onUpdate }) => {
  const [editing, setEditing] = useState<Note | null>(null);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nova Anotação',
      content: '',
      date: new Date().toLocaleDateString('pt-BR')
    };
    onUpdate([newNote, ...notes]);
    setEditing(newNote);
  };

  const saveNote = () => {
    if (!editing) return;
    onUpdate(notes.map(n => n.id === editing.id ? editing : n));
    setEditing(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-background-dark pb-24 md:pb-0">
      <header className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-background-dark sticky top-0 z-10">
        <h2 className="text-xl font-black tracking-tighter">Anotações Rápidas</h2>
        <button onClick={addNote} className="size-11 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined font-bold">edit_note</span>
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
        {notes.map(note => (
          <div key={note.id} onClick={() => setEditing(note)} className="bg-white dark:bg-surface-dark p-6 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm cursor-pointer hover:border-primary/40 transition-all h-48 flex flex-col group">
            <h3 className="font-black text-sm mb-2 group-hover:text-primary transition-colors">{note.title || 'Sem Título'}</h3>
            <p className="text-xs text-slate-500 line-clamp-4 flex-1">{note.content || 'Toque para escrever...'}</p>
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black uppercase text-slate-400">{note.date}</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">open_in_full</span>
            </div>
          </div>
        ))}
      </main>

      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-2xl p-8 rounded-[40px] border border-white/10 flex flex-col gap-6 max-h-[90vh]">
            <input 
              className="text-2xl font-black bg-transparent border-none p-0 focus:ring-0" 
              value={editing.title} 
              onChange={e => setEditing({...editing, title: e.target.value})}
              placeholder="Título da nota..."
            />
            <textarea 
              className="flex-1 min-h-[300px] bg-slate-100 dark:bg-white/5 p-6 rounded-3xl border-none font-bold text-sm focus:ring-2 focus:ring-primary"
              value={editing.content}
              onChange={e => setEditing({...editing, content: e.target.value})}
              placeholder="Escreva livremente aqui..."
            />
            <div className="flex gap-4">
              <button onClick={() => {
                onUpdate(notes.filter(n => n.id !== editing.id));
                setEditing(null);
              }} className="px-6 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Deletar</button>
              <button onClick={saveNote} className="flex-1 py-4 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20">Salvar e Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;
