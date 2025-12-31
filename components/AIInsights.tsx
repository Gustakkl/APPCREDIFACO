
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIInsightsProps {
  data: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.message) return err.message;
    try {
      return JSON.stringify(err) === '{}' ? String(err) : JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const generateAnalysis = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const tOnStreet = Number(data.totalOnStreet || 0);
      const oCount = Number(data.overdueCount || 0);
      const profit = Number(data.profit || 0);
      const cBalance = Number(data.cashBalance || 0);

      const prompt = `Analise os seguintes dados financeiros de uma empresa de crédito e forneça 3 insights estratégicos curtos e diretos em português: 
      Total Exposto: R$ ${tOnStreet.toLocaleString('pt-BR')}, 
      Inadimplência: ${oCount} clientes, 
      Lucro Estimado: R$ ${profit.toLocaleString('pt-BR')},
      Saldo em Caixa: R$ ${cBalance.toLocaleString('pt-BR')}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "Análise concluída, sem observações críticas.");
    } catch (e: any) {
      setInsight("Erro na conexão inteligente: " + getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-black p-8 rounded-[48px] border border-indigo-500/20 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-20 bg-indigo-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <span className="material-symbols-outlined font-black">psychology</span>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">CrediAI Insight</h3>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Análise Predictiva</p>
          </div>
        </div>
        <button 
          onClick={generateAnalysis}
          disabled={loading}
          className="px-6 h-12 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'ANALISANDO...' : 'EXECUTAR ANÁLISE'}
        </button>
      </div>

      {insight && (
        <div className="relative z-10 bg-black/40 backdrop-blur-md rounded-3xl p-6 border border-white/5 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[11px] leading-relaxed text-slate-300 font-medium whitespace-pre-line">{insight}</p>
        </div>
      )}
      
      {!insight && !loading && (
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest text-center py-4">Toque para diagnosticar a saúde da carteira</p>
      )}
    </div>
  );
};

export default AIInsights;
