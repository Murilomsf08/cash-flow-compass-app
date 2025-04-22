
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ExpenseDB = {
  id: number;
  date: string;
  category: string;
  description: string;
  value: number;
  status: string; // "Ativa" ou "Inativa"
};

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data as ExpenseDB[];
}

export async function addExpense(expense: Omit<ExpenseDB, 'id' | 'status'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ ...expense, status: "Ativa" }])
    .select()
    .single();
  if (error) throw error;
  return data as ExpenseDB;
}

export async function updateExpense(
  id: number,
  expense: Partial<Omit<ExpenseDB, 'id'>>
) {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ExpenseDB;
}

export async function deleteExpense(id: number) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleExpenseStatus(
  id: number,
  currentStatus: string
) {
  const newStatus = currentStatus === "Ativa" ? "Inativa" : "Ativa";
  const { data, error } = await supabase
    .from('expenses')
    .update({ status: newStatus })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ExpenseDB;
}
