
import { ExpenseDB } from "@/services/types/expenseTypes";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  // Calculate total expense
  const totalExpense = expenses.reduce((total, expense) => total + expense.value, 0);
  
  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.value;
    return acc;
  }, {} as Record<string, number>);

  // Calculate chart data by months
  const chartDataMap = new Map<string, number>();
  expenses.forEach(expense => {
    const expenseDate = parseISO(expense.date);
    const month = format(expenseDate, 'MMM/yy', { locale: ptBR });
    chartDataMap.set(month, (chartDataMap.get(month) || 0) + expense.value);
  });
  
  const chartData = Array.from(chartDataMap).map(([month, value]) => ({ month, value }));
  
  // Get current month's expenses
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const currentMonth = format(now, 'MMMM', { locale: ptBR });
  
  // Calculate total for current month
  const totalForMonth = expenses
    .filter(expense => {
      const expenseDate = parseISO(expense.date);
      return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
    })
    .reduce((sum, expense) => sum + expense.value, 0);
  
  // Calculate status data
  const statusData = expenses.reduce((acc, expense) => {
    acc[expense.status] = (acc[expense.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalExpense,
    expensesByCategory,
    chartData,
    currentMonth,
    totalForMonth,
    statusData,
    categoryStats: Object.entries(expensesByCategory).map(([category, total]) => ({
      category,
      total
    }))
  };
}
