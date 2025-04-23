
import { createClient } from '@supabase/supabase-js';

// Certifique-se de que as variáveis de ambiente estão sendo acessadas corretamente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Verificar se as credenciais do Supabase estão presentes
const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

if (!isSupabaseConfigured) {
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
  userId?: string; // ID do usuário que criou a despesa
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

// Verificar conexão com Supabase e criar tabela se não existir
export const initializeExpensesTable = async () => {
  if (!isSupabaseConfigured) return;

  try {
    // Verificar se a tabela expenses existe
    const { error: tableCheckError } = await supabase
      .from('expenses')
      .select('id')
      .limit(1);

    // Se houver um erro específico de tabela não existente, tente criar (isso exigiria permissões adequadas)
    if (tableCheckError && tableCheckError.message.includes('relation "expenses" does not exist')) {
      console.warn('Tabela "expenses" não existe. Certifique-se de que ela seja criada no painel do Supabase.');
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela expenses:', error);
  }
};

// Inicializar tabela
initializeExpensesTable();

export async function getExpenses() {
  if (!isSupabaseConfigured) {
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
    
    if (!data || data.length === 0) {
      console.log('Nenhuma despesa encontrada no banco de dados.');
      // Se não houver dados reais, use os dados simulados na primeira vez
      await seedInitialExpenses();
      const { data: seededData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: true });
        
      return seededData || [];
    }
    
    return data as ExpenseDB[];
  } catch (error) {
    console.error('Erro ao buscar despesas, usando dados mock:', error);
    // Se houver erro de conexão, use os dados simulados
    return mockExpenses;
  }
}

// Função para popular o banco de dados com dados iniciais se estiver vazio
async function seedInitialExpenses() {
  if (!isSupabaseConfigured) return;
  
  try {
    const { count, error: countError } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Erro ao verificar se há dados:', countError);
      return;
    }
    
    if (count === 0) {
      console.log('Populando banco de dados com dados iniciais...');
      const { error: insertError } = await supabase
        .from('expenses')
        .insert(mockExpenses);
        
      if (insertError) {
        console.error('Erro ao popular dados iniciais:', insertError);
      } else {
        console.log('Dados iniciais inseridos com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao verificar/popular dados iniciais:', error);
  }
}

export async function addExpense(expense: Omit<ExpenseDB, 'id'>) {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newExpense: ExpenseDB = {
      id: mockExpenses.length + 1,
      ...expense,
    };
    mockExpenses.push(newExpense);
    return newExpense;
  }

  try {
    // Adicionar tentativa de reconexão para melhorar a confiabilidade
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expense])
        .select();
      
      if (!error) {
        console.log('Despesa adicionada com sucesso:', data);
        return data?.[0] as ExpenseDB;
      }
      
      console.error(`Erro ao adicionar despesa (tentativa ${attempts + 1}/${maxAttempts}):`, error);
      attempts++;
      
      if (attempts < maxAttempts) {
        // Esperar um pouco antes de tentar novamente (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
      } else {
        throw error;
      }
    }
    
    throw new Error('Falha ao adicionar despesa após várias tentativas');
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    throw error;
  }
}

export async function addMultipleExpenses(expenses: Omit<ExpenseDB, 'id'>[]) {
  if (!isSupabaseConfigured) {
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
    
    if (error) {
      console.error('Erro ao adicionar múltiplas despesas:', error);
      throw error;
    }
    
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
  if (!isSupabaseConfigured) {
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
    
    if (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
    
    console.log('Despesa atualizada com sucesso:', data);
    return data as ExpenseDB;
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
    throw error;
  }
}

export async function deleteExpense(id: number) {
  if (!isSupabaseConfigured) {
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
    if (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
    console.log('Despesa deletada com sucesso');
  } catch (error) {
    console.error('Erro ao deletar despesa:', error);
    throw error;
  }
}

export async function toggleExpenseStatus(
  id: number,
  newStatus: string
) {
  if (!isSupabaseConfigured) {
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
    
    if (error) {
      console.error('Erro ao alterar status da despesa:', error);
      throw error;
    }
    
    console.log('Status da despesa alterado com sucesso:', data);
    return data as ExpenseDB;
  } catch (error) {
    console.error('Erro ao alterar status da despesa:', error);
    throw error;
  }
}
