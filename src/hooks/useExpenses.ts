
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  addExpense,
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
  });

  // Adicionar despesa
  const addExpenseMutation = useMutation({
    mutationFn: addExpense,
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

  // Trocar status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: number; currentStatus: string }) =>
      toggleExpenseStatus(id, currentStatus),
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
    updateExpense: updateExpenseMutation.mutateAsync,
    updating: updateExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    deleting: deleteExpenseMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    toggling: toggleStatusMutation.isPending,
  };
}
