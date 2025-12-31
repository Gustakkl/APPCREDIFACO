
import React, { useState, useRef } from 'react';
import { Customer, NotificationSettings, User, Transaction, Goal, Task, Note, CustomerStatus, Installment } from '../types';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
  customers: Customer[];
  transactions?: Transaction[];
  goals?: Goal[];
  tasks?: Task[];
  notes?: Note[];
  settings: NotificationSettings;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  user: User | null;
  onUpdateUser: (u: User) => void;
  onRestoreData?: (data: any) => Promise<void>;
  onResetSystem?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onBack, onLogout, customers, transactions = [], goals = [], tasks = [], notes = [], 
  settings, onUpdateSettings, user, onUpdateUser, onRestoreData, onResetSystem 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'pix' | 'system'>('profile');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editUser, setEditUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    pixKey: user?.pixKey || '',
    companyName: localStorage.getItem('cf_company_name') || '',
    companyAddress: localStorage.getItem('cf_company_address') || '',
    whatsappTemplate: user?.whatsappTemplate || "Olá {cliente}, identificamos uma parcela em aberto no valor de R$ {valor} com vencimento em {data}. Favor confirmar o pagamento."
  });
  
  const handleSave = () => {
    if (user) {
      onUpdateUser({
        ...user,
        name: editUser.name,
        email: editUser.email,
        pixKey: editUser.pixKey,
        whatsappTemplate: editUser.whatsappTemplate
      });
      localStorage.setItem('cf_company_name', editUser.companyName);
      localStorage.setItem('cf_company_address', editUser.companyAddress);
      alert('Configurações salvas com sucesso!');
    }
  };

  const exportBackup = () => {
    const backupData = {
      version: "3.5-global",
      timestamp: new Date().toISOString(),
      exportDate: new Date().toLocaleString('pt-BR'),
      data: { customers, transactions, goals, tasks, notes }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credifacil_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (ts: any) => {
    if (!ts) return new Date().toLocaleDateString('pt-BR');
    if (typeof ts === 'string') return ts;
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleDateString('pt-BR');
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('pt-BR');
    if (typeof ts === 'number') return new Date(ts).toLocaleDateString('pt-BR');
    try {
      return new Date(ts).toLocaleDateString('pt-BR');
    } catch(e) {
      return new Date().toLocaleDateString('pt-BR');
    }
  };

  const findArrayInObject = (obj: any, possibleKeys: string[]): any[] | null => {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj)) return obj;

    for (const key of possibleKeys) {
      if (Array.isArray(obj[key])) return obj[key];
    }

    const search = (current: any, depth: number): any[] | null => {
      if (depth > 3 || !current || typeof current !== 'object') return null;
      for (const k in current) {
        if (Array.isArray(current[k]) && current[k].length > 0 && (current[k][0]?.name || current[k][0]?.nome)) return current[k];
        const found = search(current[k], depth + 1);
        if (found) return found;
      }
      return null;
    };

    return search(obj, 0);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsProcessing(true);
        const fileContent = e.target?.result as string;
        const json = JSON.parse(fileContent);
        
        const clientsRaw = findArrayInObject(json, ['customers', 'clientes', 'clients', 'data', 'list']);
        const txsRaw = findArrayInObject(json, ['transactions', 'transacoes', 'walletTransactions', 'history']);

        if (!clientsRaw && !txsRaw) {
          throw new Error("Estrutura de dados não reconhecida.");
        }

        let importedCustomers: Customer[] = [];
        if (clientsRaw && Array.isArray(clientsRaw)) {
          importedCustomers = clientsRaw.map((c: any) => {
            const installments: Installment[] = Array.isArray(c.installments) ? c.installments : [];
            const phone = typeof c.phone === 'object' ? (c.phone.personal || c.phone.business || "") : (c.phone || c.telefone || "");
            const frequency = c.loanFrequency || c.frequency || c.frequencia || "Mensal";
            
            let balanceDue = Number(c.balanceDue || c.saldoDevedor || 0);
            let totalLoaned = Number(c.totalLoaned || c.valorTotal || 0);

            if (installments.length > 0 && balanceDue === 0) {
              balanceDue = installments.filter(i => i.status !== 'PAID').reduce((acc, i) => acc + Number(i.amount || 0), 0);
            }

            return {
              id: c.id || Math.random().toString(36).substr(2, 9),
              name: c.name || c.nome || "Cliente Importado",
              email: c.email || "",
              cpf: c.cpfCnpj || c.cpf || c.documento || "",
              phone: phone,
              status: balanceDue > 0 ? (c.status || CustomerStatus.ACTIVE) : CustomerStatus.PAID,
              joinedDate: formatDate(c.since || c.joinedDate || c.dataCriacao || c.createdAt),
              totalLoaned: totalLoaned,
              balanceDue: balanceDue,
              loanFrequency: frequency,
              avatar: c.avatarUrl || c.avatar || `https://picsum.photos/seed/${c.id || c.name}/200`,
              address: {
                cep: c.address?.cep || c.cep || "",
                street: c.address?.street || c.address?.logradouro || c.rua || "",
                number: c.address?.number || c.numero || "",
                bairro: c.address?.bairro || c.bairro || "",
                city: c.address?.city || c.cidade || "",
                state: c.address?.state || c.estado || ""
              },
              installments: installments,
              documents: c.documents || []
            };
          });
        }

        let importedTransactions: Transaction[] = [];
        if (txsRaw && Array.isArray(txsRaw)) {
          importedTransactions = txsRaw.map((tx: any) => ({
            id: tx.id || Math.random().toString(36).substr(2, 9),
            type: (tx.type === 'EXPENSE' || tx.type === 'Withdrawal' || tx.tipo === 'SAIDA' || tx.type === 'Saída') ? 'EXPENSE' : 'INCOME',
            category: tx.category || tx.categoria || 'OPERATIONAL',
            title: tx.title || tx.titulo || tx.description || tx.descricao || "Transação",
            amount: Math.abs(Number(tx.amount || tx.valor || 0)),
            date: formatDate(tx.date || tx.data || tx.createdAt),
            description: tx.description || tx.descricao || "",
            customerId: tx.customerId || tx.clienteId || null
          }));
        }

        if (onRestoreData) {
          await onRestoreData({ 
            customers: importedCustomers, 
            transactions: importedTransactions 
          });
          alert(`Restauração concluída: ${importedCustomers.length} clientes e ${importedTransactions.length} transações.`);
        }

      } catch (err: any) { 
        console.error("Falha na Importação:", err);
        const errorMsg = err.message || err.details || (typeof err === 'string' ? err : JSON.stringify(err));
        alert(`Erro na Restauração: ${errorMsg}`); 
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => alert("Erro ao ler o arquivo.");
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col flex-1 pb-32 md:pb-0 overflow-y-auto bg-black text-white font-display">
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter silver-text-gradient uppercase">Painel de Controle</h2>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mt-1">Soberania e Gestão Operacional</p>
        </div>
        <button onClick={onBack} className="size-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <div className="px-8 mt-8">
        <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Meu Perfil', icon: 'person' },
            { id: 'company', label: 'Empresa', icon: 'business' },
            { id: 'pix', label: 'Chave PIX', icon: 'qr_code' },
            { id: 'system', label: 'Backup & Reset', icon: 'settings_suggest' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-3 py-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-105' : 'text-slate-500 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="p-8 md:p-12 space-y-12 max-w-4xl">
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center gap-8 mb-10">
               <img src={user?.avatar} className="size-24 rounded-3xl border-4 border-white/5 grayscale" alt="" />
               <button className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">Alterar Foto</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Seu Nome</label>
                   <input className="w-full h-16 px-6 bg-white/5 rounded-2xl border border-white/5 focus:border-white/20 transition-all outline-none" value={editUser.name} onChange={e => setEditUser({...editUser, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-600 uppercase ml-2">E-mail de Acesso</label>
                   <input className="w-full h-16 px-6 bg-white/5 rounded-2xl border border-white/5 focus:border-white/20 transition-all outline-none" value={editUser.email} onChange={e => setEditUser({...editUser, email: e.target.value})} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Nome Fantasia / Operação</label>
                <input className="w-full h-16 px-6 bg-white/5 rounded-2xl border border-white/5 focus:border-white/20 transition-all outline-none" value={editUser.companyName} onChange={e => setEditUser({...editUser, companyName: e.target.value})} placeholder="Ex: CrediFácil Global" />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Endereço da Sede</label>
                <input className="w-full h-16 px-6 bg-white/5 rounded-2xl border border-white/5 focus:border-white/20 transition-all outline-none" value={editUser.companyAddress} onChange={e => setEditUser({...editUser, companyAddress: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase ml-2">Template de Cobrança WhatsApp</label>
                <textarea 
                  className="w-full h-32 p-6 bg-white/5 rounded-2xl border border-white/5 focus:border-white/20 transition-all outline-none text-xs font-medium" 
                  value={editUser.whatsappTemplate} 
                  onChange={e => setEditUser({...editUser, whatsappTemplate: e.target.value})}
                />
                <p className="text-[8px] text-slate-700 font-bold uppercase mt-2">Variáveis: {'{cliente}, {valor}, {data}'}</p>
             </div>
          </div>
        )}

        {activeTab === 'pix' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-white/5 p-10 rounded-[48px] border border-white/5 flex flex-col items-center text-center">
                <div className="size-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white mb-6">
                  <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                </div>
                <h3 className="text-xl font-black mb-4">Recebimentos Diretos</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-8">Configure sua chave PIX principal para que os botões de cobrança incluam os dados de pagamento automaticamente.</p>
                <input 
                  className="w-full max-w-sm h-16 px-8 bg-white/5 border border-white/10 rounded-2xl text-center font-black tracking-widest text-indigo-400 focus:border-indigo-500 transition-all outline-none" 
                  placeholder="DIGITE SUA CHAVE PIX..." 
                  value={editUser.pixKey} 
                  onChange={e => setEditUser({...editUser, pixKey: e.target.value})}
                />
             </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-12 animate-in fade-in duration-500">
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-indigo-400">cloud_upload</span>
                  <h3 className="text-sm font-black uppercase tracking-widest">Sincronização & Backup</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={exportBackup} className="h-20 bg-white text-black rounded-3xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Exportar Backup (.json)</button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isProcessing}
                    className="h-20 bg-white/5 border border-white/10 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? (
                      <span className="material-symbols-outlined animate-spin">sync</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">upload_file</span>
                        Restaurar Backup
                      </>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                </div>
             </section>

             <section className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  <h3 className="text-sm font-black uppercase tracking-widest text-red-500">Área Perigosa</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button onClick={onResetSystem} className="h-20 bg-red-900/10 border border-red-500/20 text-red-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all">Limpar Banco de Dados</button>
                   <button onClick={onLogout} className="h-20 bg-white/5 border border-white/10 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest">Encerrar Sessão</button>
                </div>
             </section>
          </div>
        )}

        <div className="pt-10 flex gap-4">
          <button onClick={handleSave} className="flex-1 h-20 bg-[#f1b400] text-black rounded-3xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
            Salvar Alterações
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsView;
