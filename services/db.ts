
import { Customer, Transaction, User } from '../types';
import { supabase } from './supabase';

// Helper para converter CamelCase (Frontend) para SnakeCase (Database)
const toSnakeCase = (obj: any) => {
  const newObj: any = {};
  for (const key in obj) {
    if (obj[key] === undefined || obj[key] === null) continue;
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

// Helper para converter SnakeCase (Database) para CamelCase (Frontend)
const toCamelCase = (obj: any) => {
  if (!obj) return null;
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/(_\w)/g, match => match[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

class DatabaseService {
  private async getUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }

  async checkConnection() {
    try {
      const { error } = await supabase.from('customers').select('id').limit(1);
      if (error) throw error;
      return { ok: true };
    } catch (e) {
      console.error("Erro de conexão DB:", e);
      return { ok: false };
    }
  }

  async getCustomers(): Promise<Customer[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return (data || []).map(c => toCamelCase(c) as Customer);
  }

  async saveCustomer(customer: Customer): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("Usuário não autenticado");
    
    const dbData = { 
      ...toSnakeCase(customer), 
      user_id: userId 
    };
    
    const { error } = await supabase
      .from('customers')
      .upsert(dbData, { onConflict: 'id' });
    
    if (error) throw error;
  }

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getTransactions(): Promise<Transaction[]> {
    const userId = await this.getUserId();
    if (!userId) return [];
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(t => toCamelCase(t) as Transaction);
  }

  async saveTransaction(tx: Transaction): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) return;
    
    const dbData = { 
      ...toSnakeCase(tx), 
      user_id: userId 
    };
    
    const { error } = await supabase
      .from('transactions')
      .upsert(dbData, { onConflict: 'id' });
    
    if (error) throw error;
  }

  async getUserProfile(): Promise<User | null> {
    const userId = await this.getUserId();
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? toCamelCase(data) as User : null;
  }

  async saveUserProfile(user: User): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) return;
    
    const profileData = { 
      ...toSnakeCase(user), 
      id: userId 
    };
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' });
    
    if (error) throw error;
  }

  async getSheetData(): Promise<string[][] | null> {
    const userId = await this.getUserId();
    if (!userId) return null;
    const { data } = await supabase.from('sheets').select('content').eq('user_id', userId).maybeSingle();
    return data?.content || null;
  }

  async saveSheetData(data: string[][]): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) return;
    await supabase.from('sheets').upsert({ user_id: userId, content: data }, { onConflict: 'user_id' });
  }

  async getAppData() {
    try {
      const [customers, transactions, user] = await Promise.all([
        this.getCustomers(),
        this.getTransactions(),
        this.getUserProfile()
      ]);
      return { customers, transactions, user };
    } catch (e) {
      console.error("Falha ao carregar App Data do Supabase:", e);
      throw e;
    }
  }
}

export const db = new DatabaseService();
