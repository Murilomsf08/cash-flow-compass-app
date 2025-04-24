
import { ExpenseDB } from "@/services/types/expenseTypes";

export const MOCK_EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Educação",
  "Saúde",
  "Lazer",
  "Vestuário",
  "Serviços",
  "Outros"
];

export const EXPENSE_STATUS = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  CANCELADO: "Cancelado"
};

export function filterExpenses(
  expenses: ExpenseDB[], 
  dateRange: { from: Date; to: Date | undefined },
  categoryFilter?: string,
  descriptionFilter?: string,
  statusFilter?: string
): ExpenseDB[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    // Date range filter
    const withinDateRange = 
      expenseDate >= dateRange.from && 
      (!dateRange.to || expenseDate <= dateRange.to);
    
    // Category filter
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    // Description filter
    const matchesDescription = !descriptionFilter || 
      expense.description.toLowerCase().includes(descriptionFilter.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || expense.status === statusFilter;
    
    return withinDateRange && matchesCategory && matchesDescription && matchesStatus;
  });
}

export function calculateExpenseStats(expenses: ExpenseDB[]) {
  const totalExpense = expenses.reduce((total, expense) => total + expense.value, 0);
  
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.value;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalExpense,
    expensesByCategory,
    categoryStats: Object.entries(expensesByCategory).map(([category, total]) => ({
      category,
      total
    }))
  };
}
