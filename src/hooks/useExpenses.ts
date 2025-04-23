
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  addExpense,
  addMultipleExpenses,
  updateExpense,
  deleteExpense,
  toggleExpenseStatus,
  ExpenseDB,
} from "@/services/expensesService";

export function useExpenses() {
  const queryClient = useQueryClient();

  // Listar despesas
  const {
    data: expenses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
    staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    retry: 2, // Tenta buscar os dados 2 vezes em caso de erro
  });

  // Adicionar despesa
  const addExpenseMutation = useMutation({
    mutationFn: addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Adicionar múltiplas despesas (para parcelamento)
  const addMultipleExpensesMutation = useMutation({
    mutationFn: addMultipleExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Editar despesa
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Excluir
  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Alterar status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      toggleExpenseStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return {
    expenses,
    isLoading,
    error,
    addExpense: addExpenseMutation.mutateAsync,
    adding: addExpenseMutation.isPending,
    addMultipleExpenses: addMultipleExpensesMutation.mutateAsync,
    addingMultiple: addMultipleExpensesMutation.isPending,
    updateExpense: updateExpenseMutation.mutateAsync,
    updating: updateExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    deleting: deleteExpenseMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    toggling: toggleStatusMutation.isPending,
  };
}
