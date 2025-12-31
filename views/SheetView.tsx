
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

const SheetView: React.FC = () => {
  const [data, setData] = useState<string[][]>(Array.from({ length: 30 }, () => Array(10).fill('')));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSheet = async () => {
      setIsLoading(true);
      const cloudData = await db.getSheetData();
      if (cloudData) {
        setData(cloudData);
      } else {
        const local = localStorage.getItem('cf_sheet_data');
        if (local) setData(JSON.parse(local));
      }
      setIsLoading(false);
    };
    loadSheet();
  }, []);

  const updateCell = async (r: number, c: number, val: string) => {
    const newData = [...data];
    newData[r][c] = val;
    setData(newData);
    
    // Salva local para feedback imediato
    localStorage.setItem('cf_sheet_data', JSON.stringify(newData));
    
    // Salva na nuvem com debounce simulado ou direto
    setIsSaving(true);
    try {
      await db.saveSheetData(newData);
    } finally {
      setIsSaving(false);
    }
  };

  const cols = ['A','B','C','D','E','F','G','H','I','J'];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <span className="material-symbols-outlined animate-spin text-white">sync</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black pb-24 md:pb-0 overflow-hidden font-display">
      <header className="p-6 md:p-8 bg-black border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 border border-white/5">
               <span className="material-symbols-outlined font-bold">grid_on</span>
            </div>
            <div>
               <h2 className="text-xl font-black tracking-tighter silver-text-gradient uppercase">Planilha de Fluxo</h2>
               <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Sincronizado com a nuvem</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            {isSaving && <span className="text-[8px] font-black text-primary uppercase animate-pulse">Salvando...</span>}
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[8px] font-black text-slate-500 uppercase tracking-widest">
               {data.length} Linhas • {cols.length} Colunas
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-8 no-scrollbar">
        <div className="inline-block min-w-full bg-[#080808] rounded-[24px] md:rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
           <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] no-scrollbar">
             <table className="w-full border-collapse table-fixed min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5">
                    <th className="w-12 border-r border-b border-white/10 sticky left-0 z-20 bg-[#080808]"></th>
                    {cols.map(c => (
                      <th key={c} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-r border-b border-white/10">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row: string[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="bg-white/5 text-center text-[9px] font-black text-slate-500 border-r border-b border-white/10 sticky left-0 z-10">{rIdx + 1}</td>
                      {row.map((cell: string, cIdx: number) => (
                        <td key={cIdx} className="border-r border-b border-white/10 p-0">
                          <input 
                            className="w-full h-10 px-3 bg-transparent border-none text-[11px] font-bold focus:bg-white/5 focus:ring-0 transition-all text-slate-300 outline-none"
                            value={cell}
                            onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SheetView;
