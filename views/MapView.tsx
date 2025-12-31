
import React, { useState, useMemo } from 'react';
import { Customer, CustomerStatus } from '../types';

interface MapViewProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
}

const MapView: React.FC<MapViewProps> = ({ customers, onSelectCustomer }) => {
  const [activeFilter, setActiveFilter] = useState<CustomerStatus | 'Todos'>('Todos');
  const [selectedPin, setSelectedPin] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    return customers.filter(c => activeFilter === 'Todos' || c.status === activeFilter);
  }, [customers, activeFilter]);

  // Simulação de pins geográficos para demonstração
  const pins = useMemo(() => {
    return filtered.map((c, i) => ({
      ...c,
      top: 20 + (Math.sin(i * 123.45) * 30 + 30),
      left: 20 + (Math.cos(i * 543.21) * 30 + 30),
    }));
  }, [filtered]);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-black font-display relative">
      {/* HUD de Controle do Mapa */}
      <header className="absolute top-6 left-6 right-6 z-50 pointer-events-none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] pointer-events-auto shadow-2xl">
            <h2 className="text-xl font-black silver-text-gradient uppercase tracking-tighter mb-1">Mapa Operacional</h2>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Roteirização de Cobrança Física</p>
          </div>

          <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl pointer-events-auto flex items-center gap-1 shadow-2xl">
            {['Todos', ...Object.values(CustomerStatus)].map(f => (
              <button 
                key={f} 
                onClick={() => setActiveFilter(f as any)} 
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Interface de Mapa Simulado (Background) */}
      <div className="absolute inset-0 bg-[#0a0a0a] overflow-hidden">
        {/* Grade de fundo estilo mapa digital */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        <div className="absolute inset-0 bg-radial-at-c from-transparent to-black opacity-80"></div>
        
        {/* Pins Dinâmicos */}
        <div className="relative w-full h-full p-20">
          {pins.map((pin) => (
            <button
              key={pin.id}
              onClick={() => setSelectedPin(pin)}
              style={{ top: `${pin.top}%`, left: `${pin.left}%` }}
              className={`absolute size-10 -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 z-20 flex items-center justify-center`}
            >
              <div className={`size-4 rounded-full border-2 border-black animate-pulse shadow-[0_0_20px_currentColor] ${pin.status === CustomerStatus.OVERDUE ? 'bg-red-500 text-red-500' : 'bg-white text-white'}`}></div>
              {selectedPin?.id === pin.id && (
                <div className="absolute top-full mt-2 bg-white text-black p-3 rounded-xl whitespace-nowrap shadow-2xl animate-in fade-in zoom-in-95">
                  <p className="text-[10px] font-black uppercase">{pin.name}</p>
                  <p className="text-[8px] font-bold opacity-60">R$ {pin.balanceDue.toLocaleString()}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Drawer de Detalhes do Pin Selecionado */}
      {selectedPin && (
        <div className="absolute bottom-28 left-6 right-6 md:bottom-10 md:left-auto md:right-10 md:w-96 z-[60] animate-in slide-in-from-bottom-10">
          <div className="bg-black/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <button onClick={() => setSelectedPin(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div className="flex items-center gap-6 mb-8">
              <img src={selectedPin.avatar} className="size-20 rounded-3xl border border-white/10 grayscale shadow-2xl" alt="" />
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">{selectedPin.name}</h3>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${selectedPin.status === CustomerStatus.OVERDUE ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-500'}`}>{selectedPin.status}</span>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Endereço de Cobrança</p>
                <p className="text-[9px] font-bold text-white uppercase text-right leading-tight max-w-[150px]">
                  {selectedPin.address?.street}, {selectedPin.address?.number}
                </p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Saldo Pendente</p>
                <p className="text-2xl font-black text-white tracking-tighter">R$ {selectedPin.balanceDue.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => onSelectCustomer(selectedPin)} className="flex-1 h-14 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Ver Perfil</button>
              <button className="size-14 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <span className="material-symbols-outlined">directions</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div className="absolute bottom-28 left-6 md:bottom-10 md:left-10 bg-black/50 backdrop-blur-xl border border-white/5 p-4 rounded-2xl space-y-2 pointer-events-none z-40">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-white shadow-[0_0_10px_white]"></div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Adimplentes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Inadimplentes</p>
        </div>
      </div>
    </div>
  );
};

export default MapView;
