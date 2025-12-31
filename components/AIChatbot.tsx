
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Customer, Transaction } from '../types';

interface AIChatbotProps {
  customers: Customer[];
  transactions: Transaction[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ customers, transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `Você é o assistente CrediAI. Dados atuais: 
      Total de Clientes: ${customers.length}, 
      Total Exposto: R$ ${customers.reduce((acc, c) => acc + c.balanceDue, 0)},
      Inadimplentes: ${customers.filter(c => c.status === 'Em Atraso').length}.
      Responda de forma curta e profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\nPergunta do Usuário: ${userMsg}`,
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Sem resposta." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: "Erro na conexão." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-[200]">
      {isOpen ? (
        <div className="w-[350px] h-[500px] bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <header className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Assistente CrediAI</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Como posso ajudar sua gestão hoje?</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed ${m.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[9px] font-black text-indigo-400 animate-pulse uppercase tracking-widest">IA Processando...</div>}
          </div>

          <div className="p-4 bg-black border-t border-white/5">
            <div className="relative">
              <input 
                placeholder="Pergunte sobre seus dados..." 
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 text-[10px] font-bold text-white focus:border-indigo-500/50 outline-none transition-all"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="size-16 rounded-full bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center hover:scale-110 active:scale-90 transition-all group border-4 border-black"
        >
          <span className="material-symbols-outlined text-3xl font-black group-hover:rotate-12 transition-transform">psychology</span>
        </button>
      )}
    </div>
  );
};

export default AIChatbot;
