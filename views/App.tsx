
import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Customer, CustomerStatus, Transaction, Installment, NotificationSettings, SystemAlert, User, Goal, Task, Note } from './types';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';
import DashboardView from './views/DashboardView';
import CustomersView from './views/CustomersView';
import WalletView from './views/WalletView';
import AnalyticsView from './views/AnalyticsView';
import CollectionsView from './views/CollectionsView';
import SettingsView from './views/SettingsView';
import SimulatorView from './views/SimulatorView';
import AddCustomerView from './views/AddCustomerView';
import CustomerDetailsView from './views/CustomerDetailsView';
import GoalsView from './views/GoalsView';
import TasksView from './views/TasksView';
import NotesView from './views/NotesView';
import SheetView from './views/SheetView';
import Navigation from './components/Navigation';
import { MOCK_CUSTOMERS, MOCK_TRANSACTIONS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    daysBefore: 3,
    showOnDashboard: true
  });

  useEffect(() => {
    const saved = {
      customers: localStorage.getItem('cf_customers'),
      txs: localStorage.getItem('cf_transactions'),
      goals: localStorage.getItem('cf_goals'),
      tasks: localStorage.getItem('cf_tasks'),
      notes: localStorage.getItem('cf_notes'),
      settings: localStorage.getItem('cf_settings'),
      session: localStorage.getItem('cf_session')
    };
    
    if (saved.session) {
      setCurrentUser(JSON.parse(saved.session));
      setIsAuthenticated(true);
      setCurrentView(AppView.DASHBOARD);
    }
    setCustomers(saved.customers ? JSON.parse(saved.customers) : MOCK_CUSTOMERS);
    setTransactions(saved.txs ? JSON.parse(saved.txs) : MOCK_TRANSACTIONS);
    setGoals(saved.goals ? JSON.parse(saved.goals) : []);
    setTasks(saved.tasks ? JSON.parse(saved.tasks) : []);
    setNotes(saved.notes ? JSON.parse(saved.notes) : []);
    if (saved.settings) setSettings(JSON.parse(saved.settings));
  }, []);

  const saveAll = (data: Partial<{customers: Customer[], txs: Transaction[], goals: Goal[], tasks: Task[], notes: Note[], user: User}>) => {
    if (data.customers !== undefined) { 
      setCustomers(data.customers); 
      localStorage.setItem('cf_customers', JSON.stringify(data.customers)); 
    }
    if (data.txs !== undefined) { 
      setTransactions(data.txs); 
      localStorage.setItem('cf_transactions', JSON.stringify(data.txs)); 
    }
    if (data.goals !== undefined) { 
      setGoals(data.goals); 
      localStorage.setItem('cf_goals', JSON.stringify(data.goals)); 
    }
    if (data.tasks !== undefined) { 
      setTasks(data.tasks); 
      localStorage.setItem('cf_tasks', JSON.stringify(data.tasks)); 
    }
    if (data.notes !== undefined) { 
      setNotes(data.notes); 
      localStorage.setItem('cf_notes', JSON.stringify(data.notes)); 
    }
    if (data.user !== undefined) { 
      setCurrentUser(data.user); 
      localStorage.setItem('cf_session', JSON.stringify(data.user)); 
    }
  };

  const showNotify = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDue = customers.reduce((acc, c) => acc + c.balanceDue, 0);
    const totalLoaned = customers.reduce((acc, c) => acc + c.totalLoaned, 0);
    const totalPaidHistorical = totalLoaned - totalDue;

    let dueToday = 0;
    let overduePrincipal = 0;
    const activeAlerts: SystemAlert[] = [];

    customers.forEach(c => {
      c.installments?.forEach(i => {
        if (i.status !== 'PAID') {
          const [d, m, y] = i.dueDate.split('/').map(Number);
          const dDate = new Date(y, m - 1, d);
          
          if (i.dueDate === todayStr) {
            dueToday += i.amount;
            activeAlerts.push({ id: i.id, customerName: c.name, amount: i.amount, dueDate: i.dueDate, daysRemaining: 0 });
          } else if (dDate < today) {
            overduePrincipal += i.amount;
            activeAlerts.push({ id: i.id, customerName: c.name, amount: i.amount, dueDate: i.dueDate, daysRemaining: -1 });
          }
        }
      });
    });

    const paidToday = transactions
      .filter(t => t.type === 'INCOME' && (t.date.includes(todayStr) || t.date.includes(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }))))
      .reduce((acc, t) => acc + t.amount, 0);

    const totalProfit = transactions
      .filter(t => t.category === 'PROFIT')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalOnStreet: totalDue,
      totalLoaned,
      totalPaid: totalPaidHistorical,
      dueToday,
      overdueWithFines: overduePrincipal,
      paidToday,
      activeContracts: customers.filter(c => c.status !== CustomerStatus.PAID && c.status !== CustomerStatus.INACTIVE).length,
      paidContracts: customers.filter(c => c.status === CustomerStatus.PAID).length,
      profit: totalProfit,
      cashBalance: transactions.reduce((acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0),
      overdueCount: customers.filter(c => c.status === CustomerStatus.OVERDUE || c.status === CustomerStatus.ACTIVE && c.balanceDue > 0 && overduePrincipal > 0).length,
      alerts: activeAlerts
    };
  }, [customers, transactions]);

  const handleUpdateUser = (u: User) => {
    saveAll({ user: u });
    showNotify('Perfil atualizado!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('cf_session');
    setCurrentView(AppView.LOGIN);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center selection:bg-white selection:text-black">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] px-6 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-top-4 duration-300">
          {notification.message}
        </div>
      )}
      <div className="w-full max-w-7xl min-h-screen flex flex-col md:flex-row bg-black md:rounded-[48px] md:my-6 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative">
        {isAuthenticated && <Navigation currentView={currentView} onViewChange={setCurrentView} user={currentUser} />}
        <div className="flex-1 overflow-hidden relative">
          {(() => {
            if (!isAuthenticated) {
              if (currentView === AppView.SIGNUP) return <SignupView onBack={() => setCurrentView(AppView.LOGIN)} onSignup={(u) => { 
                const newUser = { ...u, id: Date.now().toString(), avatar: `https://picsum.photos/seed/${u.email}/200`, pixKey: '', whatsappTemplate: '' };
                saveAll({ user: newUser });
                setIsAuthenticated(true);
                setCurrentView(AppView.DASHBOARD);
              }} />;
              if (currentView === AppView.FORGOT_PASSWORD) return <ForgotPasswordView onBack={() => setCurrentView(AppView.LOGIN)} />;
              return <LoginView onLogin={(e, p) => { 
                const mockUser = currentUser || { id: '1', name: 'Gestor Elite', email: e, avatar: `https://picsum.photos/seed/${e}/200`, pixKey: '', whatsappTemplate: '' };
                saveAll({ user: mockUser });
                setIsAuthenticated(true); 
                setCurrentView(AppView.DASHBOARD); 
              }} onSignup={() => setCurrentView(AppView.SIGNUP)} onForgot={() => setCurrentView(AppView.FORGOT_PASSWORD)} />;
            }
            switch (currentView) {
              case AppView.DASHBOARD: return <DashboardView onAction={setCurrentView} stats={stats} transactions={transactions} alerts={stats.alerts} user={currentUser} customers={customers} />;
              case AppView.CUSTOMERS: return <CustomersView customers={customers} onAdd={() => setCurrentView(AppView.ADD_CUSTOMER)} onSelect={(c) => { setSelectedCustomer(c); setCurrentView(AppView.CUSTOMER_DETAILS); }} />;
              case AppView.CUSTOMER_DETAILS: return <CustomerDetailsView customer={selectedCustomer} onBack={() => setCurrentView(AppView.CUSTOMERS)} onPayInstallment={(cId, iId) => {
                const customer = customers.find(c => c.id === cId);
                if (!customer) return;
                const updated = customers.map(c => {
                  if (c.id === cId) {
                    let amt = 0;
                    const insts = (c.installments || []).map(i => {
                      if (i.id === iId && i.status !== 'PAID') { amt = i.amount; return { ...i, status: 'PAID' as const }; }
                      return i;
                    });
                    const newBal = Math.max(0, c.balanceDue - amt);
                    return { ...c, installments: insts, balanceDue: newBal, status: newBal <= 0 ? CustomerStatus.PAID : c.status };
                  }
                  return c;
                });
                const tx: Transaction = { id: Date.now().toString(), type: 'INCOME', category: 'LOAN', title: 'Parcela Recebida', amount: 0, date: new Date().toLocaleDateString('pt-BR'), description: `Recuperação - ${customer.name}` };
                const finalCustomer = updated.find(c => c.id === cId);
                const paidAmt = customer.balanceDue - (finalCustomer?.balanceDue || 0);
                tx.amount = paidAmt;
                saveAll({ customers: updated, txs: [tx, ...transactions] });
                setSelectedCustomer(finalCustomer || null);
                showNotify(`Recebimento de R$ ${paidAmt.toLocaleString('pt-BR')} confirmado!`);
              }} transactions={transactions.filter(t => t.description.includes(selectedCustomer?.name || ''))} onDelete={() => { 
                const updated = customers.filter(c => c.id !== selectedCustomer?.id);
                saveAll({ customers: updated });
                setCurrentView(AppView.CUSTOMERS);
                showNotify('Cliente excluído.', 'info');
              }} onUpdate={(u) => {
                const updated = customers.map(c => c.id === u.id ? u : c);
                saveAll({ customers: updated });
                setSelectedCustomer(u);
              }} onQuitarTudo={(cId) => {
                const customer = customers.find(c => c.id === cId);
                if(!customer) return;
                const amount = customer.balanceDue;
                const updated = customers.map(c => c.id === cId ? { ...c, balanceDue: 0, status: CustomerStatus.PAID, installments: (c.installments || []).map(i => ({...i, status: 'PAID' as const})) } : c);
                saveAll({ customers: updated, txs: [{ id: Date.now().toString(), type: 'INCOME', category: 'PROFIT', title: 'Quitação Total', amount, date: new Date().toLocaleDateString('pt-BR'), description: `Contrato Encerrado - ${customer.name}` }, ...transactions] });
                setSelectedCustomer(updated.find(c => c.id === cId) || null);
                showNotify('Contrato quitado com sucesso!');
              }} />;
              case AppView.WALLET: return <WalletView transactions={transactions} balance={stats.cashBalance} onAddTransaction={(tx) => saveAll({ txs: [tx, ...transactions] })} />;
              case AppView.ANALYTICS: return <AnalyticsView stats={stats} customers={customers} transactions={transactions} />;
              case AppView.COLLECTIONS: return <CollectionsView customers={customers} stats={stats} user={currentUser} onMarkAsPaid={(cId, iId) => {
                const customer = customers.find(c => c.id === cId);
                if (!customer) return;
                const updated = customers.map(c => {
                  if (c.id === cId) {
                    let amt = 0;
                    const insts = (c.installments || []).map(i => {
                      if (i.id === iId && i.status !== 'PAID') { amt = i.amount; return { ...i, status: 'PAID' as const }; }
                      return i;
                    });
                    const newBal = Math.max(0, c.balanceDue - amt);
                    return { ...c, installments: insts, balanceDue: newBal, status: newBal <= 0 ? CustomerStatus.PAID : c.status };
                  }
                  return c;
                });
                const tx: Transaction = { id: Date.now().toString(), type: 'INCOME', category: 'LOAN', title: 'Parcela Recebida', amount: 0, date: new Date().toLocaleDateString('pt-BR'), description: `Recuperação - ${customer.name}` };
                const finalCustomer = updated.find(c => c.id === cId);
                const paidAmt = customer.balanceDue - (finalCustomer?.balanceDue || 0);
                tx.amount = paidAmt;
                saveAll({ customers: updated, txs: [tx, ...transactions] });
                showNotify(`R$ ${paidAmt.toLocaleString('pt-BR')} recebido de ${customer.name}`);
              }} />;
              case AppView.SIMULATOR: return <SimulatorView onBack={() => setCurrentView(AppView.DASHBOARD)} customers={customers} onApply={(cId, amt, mon) => {
                const customer = customers.find(c => c.id === cId);
                if(!customer) return;
                const installmentValue = amt / mon;
                const newInsts = Array.from({ length: mon }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() + (i + 1));
                  return { id: Math.random().toString(36).substr(2, 9), number: i + 1, dueDate: d.toLocaleDateString('pt-BR'), amount: installmentValue, status: 'PENDING' as const };
                });
                const updated = customers.map(c => c.id === cId ? { ...c, balanceDue: c.balanceDue + amt, totalLoaned: c.totalLoaned + amt, installments: [...(c.installments || []), ...newInsts], status: CustomerStatus.ACTIVE } : c);
                saveAll({ customers: updated, txs: [{ id: Date.now().toString(), type: 'EXPENSE', category: 'LOAN', title: 'Saída Capital', amount: amt / 1.1, date: new Date().toLocaleDateString('pt-BR'), description: `Contrato: ${customer.name}` }, ...transactions] });
                showNotify('Novo contrato efetivado!');
                setCurrentView(AppView.DASHBOARD);
              }} />;
              case AppView.GOALS: return <GoalsView goals={goals} onUpdate={(g) => saveAll({ goals: g })} />;
              case AppView.TASKS: return <TasksView tasks={tasks} onUpdate={(t) => saveAll({ tasks: t })} />;
              case AppView.NOTES: return <NotesView notes={notes} onUpdate={(n) => saveAll({ notes: n })} />;
              case AppView.SHEET: return <SheetView />;
              case AppView.SETTINGS: return <SettingsView user={currentUser} onUpdateUser={handleUpdateUser} settings={settings} onUpdateSettings={setSettings} onLogout={handleLogout} onBack={() => setCurrentView(AppView.DASHBOARD)} customers={customers} />;
              case AppView.ADD_CUSTOMER: return <AddCustomerView onBack={() => setCurrentView(AppView.CUSTOMERS)} onSave={(c) => { saveAll({ customers: [c, ...customers] }); showNotify('Cliente cadastrado!'); setCurrentView(AppView.CUSTOMERS); }} />;
              default: return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default App;
