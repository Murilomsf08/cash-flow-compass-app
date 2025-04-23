
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
      try {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      } catch (error) {
        console.error("Erro ao filtrar por data:", error);
        return false;
      }
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
  // Garantir que expenses é um array válido
  const validExpenses = Array.isArray(expenses) ? expenses : [];

  // Calcular o total de despesas
  const totalExpense = validExpenses.reduce((acc, e) => acc + (e.value || 0), 0);

  // Calcular despesas por categoria
  const expensesByCategory = validExpenses.reduce((acc: Record<string, number>, expense) => {
    if (acc[expense.category]) acc[expense.category] += expense.value;
    else acc[expense.category] = expense.value;
    return acc;
  }, {});

  // Calcular despesas mensais para o gráfico
  const monthlyExpenses = validExpenses.reduce((acc: Record<string, number>, expense) => {
    try {
      const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
      if (acc[month]) acc[month] += expense.value;
      else acc[month] = expense.value;
    } catch (error) {
      console.error("Erro ao processar data da despesa:", error);
    }
    return acc;
  }, {});

  // Preparar dados para o gráfico
  const chartData = Object.entries(monthlyExpenses).map(([month, value]) => ({
    month,
    value,
  }));

  // Calcular total do mês atual
  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
  const totalForMonth = validExpenses.reduce((acc, expense) => {
    try {
      const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
      if (month === currentMonth) acc += expense.value;
    } catch (error) {
      console.error("Erro ao processar data para o mês atual:", error);
    }
    return acc;
  }, 0);

  // Calcular dados por status
  const statusData = validExpenses.reduce((acc: Record<string, number>, expense) => {
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
