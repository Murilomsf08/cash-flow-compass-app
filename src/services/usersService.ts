
import { createClient } from '@supabase/supabase-js';
import { User, UserRole } from '@/contexts/AuthContext';

// Use the same supabase client configuration as in expensesService.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verifica se há uma conexão válida com o Supabase
const isSupabaseConnected = supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
                             supabaseAnonKey !== 'your-anon-key';

// Mock users for when Supabase is not connected
const MOCK_USERS: User[] = [
  { id: 1, name: "Admin", email: "admin@finq.com", role: "owner", approved: true },
  { id: 2, name: "Gerente", email: "gerente@finq.com", role: "admin", approved: true },
  { id: 3, name: "Colaborador", email: "colaborador@finq.com", role: "collaborator", approved: true },
  { id: 4, name: "Pendente", email: "pendente@finq.com", role: "collaborator", approved: false },
  { id: 5, name: "João Silva", email: "joao@finq.com", role: "collaborator", approved: true },
  { id: 6, name: "Maria Souza", email: "maria@finq.com", role: "collaborator", approved: false },
];

export async function getUsers() {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    return MOCK_USERS;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return MOCK_USERS;
  }
}

export async function updateUser(
  id: number, 
  updates: { role?: UserRole, approved?: boolean }
) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index >= 0) {
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...updates };
      return MOCK_USERS[index];
    }
    throw new Error('Usuário não encontrado');
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index >= 0) {
      MOCK_USERS.splice(index, 1);
      return;
    }
    throw new Error('Usuário não encontrado');
  }

  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
}
