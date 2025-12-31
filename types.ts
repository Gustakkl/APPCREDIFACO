
export enum AppView {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  DASHBOARD = 'DASHBOARD',
  CUSTOMERS = 'CUSTOMERS',
  CUSTOMER_DETAILS = 'CUSTOMER_DETAILS',
  ADD_CUSTOMER = 'ADD_CUSTOMER',
  WALLET = 'WALLET',
  ANALYTICS = 'ANALYTICS',
  COLLECTIONS = 'COLLECTIONS',
  SETTINGS = 'SETTINGS',
  SIMULATOR = 'SIMULATOR',
  GOALS = 'GOALS',
  TASKS = 'TASKS',
  NOTES = 'NOTES',
  SHEET = 'SHEET',
  EXPENSES = 'EXPENSES',
  MAP = 'MAP'
}

export enum CustomerStatus {
  ACTIVE = 'Ativo',
  OVERDUE = 'Em Atraso',
  INACTIVE = 'Inativo',
  PAID = 'Quitado'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  pixKey?: string;
  whatsappTemplate?: string;
}

export interface Installment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
}

export interface CustomerDocument {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: CustomerStatus;
  joinedDate: string;
  totalLoaned: number;
  balanceDue: number;
  loanFrequency?: string; // NOVO: Diário, Semanal, Quinzenal, Mensal
  avatar?: string;
  installments?: Installment[];
  score?: number;
  documents?: CustomerDocument[];
  address?: {
    cep: string;
    street: string;
    number: string;
    bairro: string;
    city: string;
    state: string;
    lat?: number;
    lng?: number;
  };
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: 'LOAN' | 'PROFIT' | 'OPERATIONAL' | 'RENT' | 'SALE' | 'ADJUST' | 'MARKETING';
  title: string;
  amount: number;
  date: string;
  description: string;
  customerId?: string; 
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBefore: number;
  showOnDashboard: boolean;
}

export interface SystemAlert {
  id: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
}
