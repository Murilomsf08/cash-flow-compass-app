
import { createClient } from '@supabase/supabase-js';

// Certifique-se de que as variáveis de ambiente estão sendo acessadas corretamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Verifique se as variáveis foram carregadas com valores reais
if (supabaseUrl === 'https://your-supabase-url.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.error('Variáveis de ambiente do Supabase não encontradas ou usando valores padrão. Para funcionalidade completa, conecte-se à Supabase através da integração Lovable.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ExpenseDB = {
  id: number;
  date: string;
  category: string;
  description: string;
  value: number;
  status: string; // "Pago" | "Pendente" | "Cancelado"
  paymentType?: string; // "À Vista" | "Parcelado"
  installment?: number; // Número da parcela atual
  totalInstallments?: number; // Número total de parcelas
};

// Mock data para teste quando o Supabase não está disponível
const mockExpenses: ExpenseDB[] = [
  {
    id: 1,
    date: '2023-04-15',
    category: 'Alimentação',
    description: 'Almoço de negócios',
    value: 120.50,
    status: 'Pago',
    paymentType: 'À Vista'
  },
  {
    id: 2,
    date: '2023-04-18',
    category: 'Transporte',
    description: 'Gasolina',
    value: 200.00,
    status: 'Pendente',
    paymentType: 'À Vista'
  },
  {
    id: 3,
    date: '2023-05-10',
    category: 'Equipamentos',
    description: 'Computador novo',
    value: 1000.00,
    status: 'Pago',
    paymentType: 'Parcelado',
    installment: 1,
    totalInstallments: 5
  },
  {
    id: 4,
    date: '2023-06-10',
    category: 'Equipamentos',
    description: 'Computador novo',
    value: 1000.00,
    status: 'Pendente',
    paymentType: 'Parcelado',
    installment: 2,
    totalInstallments: 5
  }
];

// Verifica se há uma conexão válida com o Supabase
const isSupabaseConnected = supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
                           supabaseAnonKey !== 'your-anon-key';

export async function getExpenses() {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    return mockExpenses;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
    
    console.log('Dados obtidos do Supabase:', data);
    return data as ExpenseDB[];
  } catch (error) {
    console.error('Erro ao buscar despesas, usando dados mock:', error);
    return mockExpenses;
  }
}

export async function addExpense(expense: Omit<ExpenseDB, 'id'>) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newExpense: ExpenseDB = {
      id: mockExpenses.length + 1,
      ...expense,
    };
    mockExpenses.push(newExpense);
    return newExpense;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();
    
    if (error) throw error;
    return data as ExpenseDB;
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    throw error;
  }
}

export async function addMultipleExpenses(expenses: Omit<ExpenseDB, 'id'>[]) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newExpenses = expenses.map((expense, index) => {
      const newExpense: ExpenseDB = {
        id: mockExpenses.length + 1 + index,
        ...expense,
      };
      mockExpenses.push(newExpense);
      return newExpense;
    });
    return newExpenses;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenses)
      .select();
    
    if (error) throw error;
    return data as ExpenseDB[];
  } catch (error) {
    console.error('Erro ao adicionar múltiplas despesas:', error);
    throw error;
  }
}

export async function updateExpense(
  id: number,
  expense: Partial<Omit<ExpenseDB, 'id'>>
) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses[index] = { ...mockExpenses[index], ...expense };
      return mockExpenses[index];
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExpenseDB;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
}

export async function deleteExpense(id: number) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses.splice(index, 1);
      return;
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    throw error;
  }
}

export async function toggleExpenseStatus(
  id: number,
  newStatus: string
) {
  if (!isSupabaseConnected) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses[index].status = newStatus;
      return mockExpenses[index];
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExpenseDB;
  } catch (error) {
    console.error('Erro ao alterar status da despesa:', error);
    throw error;
  }
}
