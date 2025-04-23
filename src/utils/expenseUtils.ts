
import { format, parseISO, isWithinInterval } from "date-fns";
import { ExpenseDB } from "@/services/expensesService";
import { ptBR } from "date-fns/locale";

export const MOCK_EXPENSE_CATEGORIES = [
  "Aluguel",
  "Salários",
  "Marketing",
  "Contas",
  "Impostos",
  "Equipamentos",
  "Manutenção",
  "Alimentação",
  "Transporte",
  "Outros",
];

export const EXPENSE_STATUS = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  CANCELADO: "Cancelado",
} as const;

export function filterExpenses(
  expenses: ExpenseDB[] | null,
  dateRange: { from: Date; to: Date | undefined },
  categoryFilter?: string,
  descriptionFilter?: string,
  statusFilter?: string
) {
  if (!expenses || !Array.isArray(expenses)) return [];

  let filtered = [...expenses];

  if (dateRange.from && dateRange.to) {
    filtered = filtered.filter((expense) => {
      const expenseDate = parseISO(expense.date);
      return isWithinInterval(expenseDate, {
        start: dateRange.from,
        end: dateRange.to,
      });
    });
  }

  if (categoryFilter) {
    filtered = filtered.filter((expense) => expense.category === categoryFilter);
  }

  if (descriptionFilter) {
    filtered = filtered.filter((expense) =>
      expense.description.toLowerCase().includes(descriptionFilter.toLowerCase())
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((expense) => expense.status === statusFilter);
  }

  return filtered;
}

export function calculateExpenseStats(expenses: ExpenseDB[]) {
  const totalExpense = expenses.reduce((acc, e) => acc + (e.value || 0), 0);

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
    if (acc[expense.category]) acc[expense.category] += expense.value;
    else acc[expense.category] = expense.value;
    return acc;
  }, {});

  const monthlyExpenses = expenses.reduce((acc: Record<string, number>, expense) => {
    const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
    if (acc[month]) acc[month] += expense.value;
    else acc[month] = expense.value;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyExpenses).map(([month, value]) => ({
    month,
    value,
  }));

  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
  const totalForMonth = expenses.reduce((acc, expense) => {
    const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
    if (month === currentMonth) acc += expense.value;
    return acc;
  }, 0);

  const statusData = expenses.reduce((acc: Record<string, number>, expense) => {
    if (!acc[expense.status]) acc[expense.status] = 0;
    acc[expense.status] += 1;
    return acc;
  }, {});

  return {
    totalExpense,
    expensesByCategory,
    chartData,
    currentMonth,
    totalForMonth,
    statusData
  };
}
