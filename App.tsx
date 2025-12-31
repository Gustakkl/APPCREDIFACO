
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
// Import ExpensesView to fix the "Cannot find name 'ExpensesView'" error
import ExpensesView from './views/ExpensesView';
import Navigation from './components/Navigation';
import GlobalHeader from './components/GlobalHeader';
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

    const totalDue = customers.reduce((acc, c) => acc + Number(c.balanceDue || 0), 0);
    const totalLoaned = customers.reduce((acc, c) => acc + Number(c.totalLoaned || 0), 0);
    const totalPaid = totalLoaned - totalDue;

    let dueToday = 0;
    let overduePrincipal = 0;
    const activeAlerts: SystemAlert[] = [];

    customers.forEach(c => {
      c.installments?.forEach(i => {
        if (i.status !== 'PAID') {
          const [d, m, y] = i.dueDate.split('/').map(Number);
          const dDate = new Date(y, m - 1, d);
          if (i.dueDate === todayStr) {
            dueToday += Number(i.amount);
            activeAlerts.push({ id: i.id, customerName: c.name, amount: i.amount, dueDate: i.dueDate, daysRemaining: 0 });
          } else if (dDate < today) {
            overduePrincipal += Number(i.amount);
            activeAlerts.push({ id: i.id, customerName: c.name, amount: i.amount, dueDate: i.dueDate, daysRemaining: -1 });
          }
        }
      });
    });

    const cashBalance = transactions.reduce((acc, tx) => {
      const amt = Number(tx.amount || 0);
      return tx.type === 'INCOME' ? acc + amt : acc - amt;
    }, 0);

    return {
      totalOnStreet: totalDue,
      totalLoaned,
      totalPaid,
      dueToday,
      overdueWithFines: overduePrincipal,
      cashBalance,
      overdueCount: activeAlerts.filter(a => a.daysRemaining < 0).length,
      alerts: activeAlerts,
      paidToday: transactions.filter(t => t.type === 'INCOME' && t.date === todayStr).reduce((acc, t) => acc + Number(t.amount || 0), 0),
      profit: transactions.filter(t => t.category === 'PROFIT').reduce((acc, t) => acc + Number(t.amount || 0), 0)
    };
  }, [customers, transactions]);

  const handleLogout = () => {
    localStorage.removeItem('cf_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView(AppView.LOGIN);
    showNotify('Sessão encerrada com sucesso.', 'info');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-white selection:text-black">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] px-6 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.2)] animate-in fade-in slide-in-from-top-4 duration-300">
          {notification.message}
        </div>
      )}
      <div className="flex flex-col md:flex-row h-screen overflow-hidden">
        {isAuthenticated && (
          <Navigation 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            user={currentUser} 
            onLogout={handleLogout} 
          />
        )}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[#020202]">
          {isAuthenticated && (
            <GlobalHeader 
              user={currentUser} 
              cashBalance={stats.cashBalance} 
              totalOnStreet={stats.totalOnStreet} 
              onViewChange={setCurrentView} 
              onLogout={handleLogout}
              notificationsCount={stats.alerts.length}
              alerts={stats.alerts}
              onSelectCustomerByName={(name) => {
                const c = customers.find(x => x.name === name);
                if (c) { setSelectedCustomer(c); setCurrentView(AppView.CUSTOMER_DETAILS); }
              }}
            />
          )}

          <div className="flex-1 overflow-y-auto no-scrollbar pb-24 md:pb-0">
            {!isAuthenticated ? (
               <LoginView 
                 onLogin={(e, p) => { 
                   const u = { id: '1', name: 'Gestor Elite', email: e, avatar: `https://picsum.photos/seed/${e}/200` };
                   saveAll({ user: u });
                   setIsAuthenticated(true); 
                   setCurrentView(AppView.DASHBOARD); 
                 }} 
                 onSignup={() => setCurrentView(AppView.SIGNUP)} 
                 onForgot={() => setCurrentView(AppView.FORGOT_PASSWORD)} 
               />
            ) : (
              (() => {
                switch(currentView) {
                  case AppView.DASHBOARD: return <DashboardView onAction={setCurrentView} stats={stats} transactions={transactions} alerts={stats.alerts} user={currentUser} customers={customers} />;
                  case AppView.CUSTOMERS: return <CustomersView customers={customers} onAdd={() => setCurrentView(AppView.ADD_CUSTOMER)} onSelect={(c) => { setSelectedCustomer(c); setCurrentView(AppView.CUSTOMER_DETAILS); }} />;
                  case AppView.CUSTOMER_DETAILS: return (
                    <CustomerDetailsView 
                      customer={selectedCustomer} 
                      onBack={() => setCurrentView(AppView.CUSTOMERS)} 
                      onPayInstallment={(cId, iId, amount) => {
                        const customer = customers.find(c => c.id === cId);
                        if (!customer) return;
                        const updated = customers.map(c => {
                          if (c.id === cId) {
                            const insts = (c.installments || []).map(i => i.id === iId ? { ...i, status: 'PAID' as any } : i);
                            const newBal = Math.max(0, c.balanceDue - amount);
                            return { ...c, installments: insts, balanceDue: newBal, status: newBal <= 0 ? CustomerStatus.PAID : c.status };
                          }
                          return c;
                        });
                        const tx: Transaction = { id: Date.now().toString(), type: 'INCOME', category: 'LOAN', title: 'Liquidação Parcial', amount: Number(amount), date: new Date().toLocaleDateString('pt-BR'), description: `Recuperação: ${customer.name}` };
                        saveAll({ customers: updated, txs: [tx, ...transactions] });
                        setSelectedCustomer(updated.find(c => c.id === cId) || null);
                        showNotify(`Liquidação de R$ ${amount.toLocaleString()} registrada.`);
                      }} 
                      transactions={transactions} 
                      onDelete={() => { saveAll({ customers: customers.filter(c => c.id !== selectedCustomer?.id) }); setCurrentView(AppView.CUSTOMERS); }} 
                      onUpdate={(u) => { saveAll({ customers: customers.map(c => c.id === u.id ? u : c) }); setSelectedCustomer(u); }}
                      onClearHistory={(cId) => saveAll({ txs: transactions.filter(t => t.customerId !== cId) })}
                      onDeleteInstallment={(cId, iId) => {
                        const updated = customers.map(c => {
                          if (c.id === cId) {
                            const inst = c.installments?.find(i => i.id === iId);
                            const newInsts = (c.installments || []).filter(i => i.id !== iId);
                            const deducao = inst?.status !== 'PAID' ? (inst?.amount || 0) : 0;
                            return { ...c, installments: newInsts, balanceDue: Math.max(0, c.balanceDue - deducao) };
                          }
                          return c;
                        });
                        saveAll({ customers: updated });
                        setSelectedCustomer(updated.find(c => c.id === cId) || null);
                      }}
                      onQuitarTudo={(cId) => {
                        const customer = customers.find(c => c.id === cId);
                        if(!customer) return;
                        const amt = customer.balanceDue;
                        const updated = customers.map(c => c.id === cId ? { ...c, balanceDue: 0, status: CustomerStatus.PAID, installments: (c.installments || []).map(i => ({...i, status: 'PAID' as const})) } : c);
                        saveAll({ customers: updated, txs: [{ id: Date.now().toString(), type: 'INCOME', category: 'PROFIT', title: 'Quitação Total', amount: Number(amt), date: new Date().toLocaleDateString('pt-BR'), description: `Contrato Liquidado: ${customer.name}` }, ...transactions] });
                        setSelectedCustomer(updated.find(c => c.id === cId) || null);
                      }}
                    />
                  );
                  case AppView.WALLET: return <WalletView transactions={transactions} balance={stats.cashBalance} onAddTransaction={(tx) => saveAll({ txs: [tx, ...transactions] })} />;
                  case AppView.EXPENSES: return <ExpensesView transactions={transactions} onAddTransaction={(tx) => saveAll({ txs: [tx, ...transactions] })} />;
                  case AppView.ANALYTICS: return <AnalyticsView stats={stats} customers={customers} transactions={transactions} />;
                  case AppView.COLLECTIONS: return <CollectionsView customers={customers} stats={stats} user={currentUser} onMarkAsPaid={(cId, iId) => {
                    const customer = customers.find(c => c.id === cId);
                    if (!customer) return;
                    const inst = customer.installments?.find(i => i.id === iId);
                    const amount = inst?.amount || 0;
                    const updated = customers.map(c => {
                      if (c.id === cId) {
                        const insts = (c.installments || []).map(i => i.id === iId ? { ...i, status: 'PAID' as any } : i);
                        const newBal = Math.max(0, c.balanceDue - amount);
                        return { ...c, installments: insts, balanceDue: newBal, status: newBal <= 0 ? CustomerStatus.PAID : c.status };
                      }
                      return c;
                    });
                    saveAll({ customers: updated, txs: [{ id: Date.now().toString(), type: 'INCOME', category: 'LOAN', title: 'Cobrança Liquidada', amount: Number(amount), date: new Date().toLocaleDateString('pt-BR'), description: `Recuperação: ${customer.name}` }, ...transactions] });
                  }} />;
                  case AppView.SETTINGS: return <SettingsView user={currentUser} onUpdateUser={(u) => saveAll({ user: u })} settings={settings} onUpdateSettings={setSettings} onLogout={handleLogout} onBack={() => setCurrentView(AppView.DASHBOARD)} customers={customers} />;
                  case AppView.ADD_CUSTOMER: return <AddCustomerView onBack={() => setCurrentView(AppView.CUSTOMERS)} onSave={(c) => { saveAll({ customers: [c, ...customers] }); setCurrentView(AppView.CUSTOMERS); }} />;
                  default: return <DashboardView onAction={setCurrentView} stats={stats} transactions={transactions} alerts={stats.alerts} user={currentUser} customers={customers} />;
                }
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
