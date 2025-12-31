
import React, { useState, useEffect, useRef } from 'react';

interface LoginViewProps {
  onLogin: (email: string, pass: string) => void;
  onSignup: () => void;
  onForgot: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignup, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = "https://i.postimg.cc/jSLvWLXS/Whats-App-Image-2025-11-30-at-14-13-28-1-removebg-preview.png";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    const count = window.innerWidth < 768 ? 30 : 80;

    class P {
      x: number; y: number; vx: number; vy: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }
      draw() {
        ctx!.fillStyle = 'rgba(255,255,255,0.2)';
        ctx!.beginPath(); ctx!.arc(this.x, this.y, 1, 0, Math.PI * 2); ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({length: count}, () => new P());
    };

    const anim = () => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(anim);
    };

    window.addEventListener('resize', init);
    init(); anim();
    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-display">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50" />
      
      <div className="w-full max-w-md relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-full flex justify-center mb-6">
            <img 
              src={logoUrl} 
              alt="CREDIFACIL GLOBAL" 
              className="h-32 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
            />
          </div>
          <h1 className="text-4xl font-black silver-text-gradient tracking-tighter uppercase">CrediFácil Global</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Terminal de Acesso Seguro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="E-MAIL" 
              required
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-sm font-bold focus:ring-1 focus:ring-white/30 transition-all text-white placeholder:text-slate-700 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="SENHA" 
              required
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl px-8 text-sm font-bold focus:ring-1 focus:ring-white/30 transition-all text-white placeholder:text-slate-700 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-6">
          <button onClick={onForgot} className="text-[9px] font-black uppercase text-slate-500 tracking-widest hover:text-white transition-all">Esqueceu a senha?</button>
          <div className="h-[1px] w-20 bg-white/10"></div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Não tem conta?</p>
          <button onClick={onSignup} className="px-10 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Criar Registro
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
