
import { supabase, isSupabaseConfigured, handleSupabaseError } from './config/supabaseConfig';
import { ExpenseDB, mockExpenses } from './types/expenseTypes';
import { initializeExpensesTable, seedInitialExpenses } from './database/initializeExpensesDb';
import { toast } from "@/hooks/use-toast";

// Initialize the database
initializeExpensesTable();

export async function getExpenses(): Promise<ExpenseDB[]> {
  if (!isSupabaseConfigured) {
    console.warn('Usando dados simulados para despesas. Conecte-se ao Supabase para dados reais.');
    return [...mockExpenses];
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      return handleSupabaseError(error, 'buscar despesas');
    }
    
    if (!data || data.length === 0) {
      await seedInitialExpenses();
      const { data: seededData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      return seededData || [];
    }
    
    return data as ExpenseDB[];
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    toast({
      title: "Erro ao carregar despesas",
      description: "Usando dados locais temporariamente. Por favor, verifique sua conexão.",
      variant: "destructive",
    });
    return [...mockExpenses];
  }
}

export async function addExpense(expense: Omit<ExpenseDB, 'id'>): Promise<ExpenseDB> {
  if (!isSupabaseConfigured) {
    const newExpense: ExpenseDB = {
      id: mockExpenses.length + 1,
      ...expense,
    };
    mockExpenses.push(newExpense);
    toast({
      title: "Despesa adicionada (modo simulado)",
      description: "A despesa foi salva localmente.",
    });
    return newExpense;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'adicionar despesa');
    }
    
    toast({
      title: "Despesa adicionada",
      description: "A despesa foi cadastrada com sucesso.",
    });
    
    return data?.[0] as ExpenseDB;
  } catch (error) {
    return handleSupabaseError(error, 'adicionar despesa');
  }
}

export async function addMultipleExpenses(expenses: Omit<ExpenseDB, 'id'>[]): Promise<ExpenseDB[]> {
  if (!isSupabaseConfigured) {
    const newExpenses = expenses.map((expense, index) => {
      const newExpense: ExpenseDB = {
        id: mockExpenses.length + 1 + index,
        ...expense,
      };
      mockExpenses.push(newExpense);
      return newExpense;
    });
    toast({
      title: "Despesas adicionadas (modo simulado)",
      description: "As despesas foram salvas localmente.",
    });
    return newExpenses;
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenses)
      .select();
    
    if (error) {
      return handleSupabaseError(error, 'adicionar múltiplas despesas');
    }
    
    toast({
      title: "Despesas adicionadas",
      description: "As despesas foram cadastradas com sucesso.",
    });
    
    return data as ExpenseDB[];
  } catch (error) {
    return handleSupabaseError(error, 'adicionar múltiplas despesas');
  }
}

export async function updateExpense(
  id: number,
  expense: Partial<Omit<ExpenseDB, 'id'>>
): Promise<ExpenseDB> {
  if (!isSupabaseConfigured) {
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses[index] = { ...mockExpenses[index], ...expense };
      toast({
        title: "Despesa atualizada (modo simulado)",
        description: "A despesa foi atualizada localmente.",
      });
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
      return handleSupabaseError(error, 'atualizar despesa');
    }
    
    toast({
      title: "Despesa atualizada",
      description: "A despesa foi atualizada com sucesso.",
    });
    
    return data as ExpenseDB;
  } catch (error) {
    return handleSupabaseError(error, 'atualizar despesa');
  }
}

export async function deleteExpense(id: number): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses.splice(index, 1);
      toast({
        title: "Despesa removida (modo simulado)",
        description: "A despesa foi removida localmente.",
      });
      return;
    }
    throw new Error('Despesa não encontrada');
  }

  try {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) {
      handleSupabaseError(error, 'deletar despesa');
      return;
    }
    
    toast({
      title: "Despesa removida",
      description: "A despesa foi removida com sucesso.",
    });
  } catch (error) {
    handleSupabaseError(error, 'deletar despesa');
  }
}

export async function toggleExpenseStatus(
  id: number,
  newStatus: string
): Promise<ExpenseDB> {
  if (!isSupabaseConfigured) {
    const index = mockExpenses.findIndex(e => e.id === id);
    if (index >= 0) {
      mockExpenses[index].status = newStatus;
      toast({
        title: "Status atualizado (modo simulado)",
        description: "O status foi atualizado localmente.",
      });
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
      return handleSupabaseError(error, 'alterar status da despesa');
    }
    
    toast({
      title: "Status atualizado",
      description: "O status da despesa foi atualizado com sucesso.",
    });
    
    return data as ExpenseDB;
  } catch (error) {
    return handleSupabaseError(error, 'alterar status da despesa');
  }
}
