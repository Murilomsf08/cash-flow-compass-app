import { supabase, isSupabaseConfigured, handleSupabaseError } from './config/supabaseConfig';
import { ExpenseDB, mockExpenses } from './types/expenseTypes';
import { toast } from "@/hooks/use-toast";

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
    
    return (data as ExpenseDB[]) || [];
  } catch (error) {
    console.error('Erro ao buscar despesas, usando dados mock:', error);
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
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newExpense: ExpenseDB = {
      id: mockExpenses.length + 1,
      ...expense,
    };
    mockExpenses.push(newExpense);
    toast({
      title: "Despesa adicionada (modo simulado)",
      description: "A despesa foi salva localmente, mas não no banco de dados.",
      variant: "default",
    });
    return { ...newExpense };
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
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const newExpenses: ExpenseDB[] = expenses.map((expense, index) => ({
      id: mockExpenses.length + index + 1,
      ...expense,
    }));
    mockExpenses.push(...newExpenses);
    toast({
      title: "Despesas adicionadas (modo simulado)",
      description: "As despesas foram salvas localmente, mas não no banco de dados.",
      variant: "default",
    });
    return [...newExpenses];
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
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockExpenses.findIndex(p => p.id === id);
    if (index >= 0) {
      mockExpenses[index] = { ...mockExpenses[index], ...expense };
      toast({
        title: "Despesa atualizada (modo simulado)",
        description: "A despesa foi atualizada localmente, mas não no banco de dados.",
      });
      return { ...mockExpenses[index] };
    }
    toast({
      title: "Erro",
      description: "Despesa não encontrada.",
      variant: "destructive",
    });
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
    console.warn('Usando dados simulados. Conecte-se ao Supabase para dados reais.');
    const index = mockExpenses.findIndex(p => p.id === id);
    if (index >= 0) {
      mockExpenses.splice(index, 1);
      toast({
        title: "Despesa removida (modo simulado)",
        description: "A despesa foi removida localmente, mas não no banco de dados.",
      });
      return;
    }
    toast({
      title: "Erro",
      description: "Despesa não encontrada.",
      variant: "destructive",
    });
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

export async function toggleExpenseStatus(id: number, newStatus: string): Promise<ExpenseDB> {
  return updateExpense(id, { status: newStatus });
}
