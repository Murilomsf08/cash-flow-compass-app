import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSellers,
  addSeller,
  updateSeller,
  deleteSeller,
} from "@/services/sellersService";
import { SellerDB } from "@/services/types/sellerTypes";

export function useSellers() {
  const queryClient = useQueryClient();

  // Listar vendedores
  const {
    data: sellers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sellers"],
    queryFn: getSellers,
    staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    retry: 2, // Tenta buscar os dados 2 vezes em caso de erro
    refetchOnWindowFocus: true, // Recarrega os dados quando o foco volta para a janela
    refetchOnMount: true, // Recarrega os dados quando o componente é montado
  });

  // Adicionar vendedor
  const addSellerMutation = useMutation({
    mutationFn: addSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  // Editar vendedor
  const updateSellerMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      updateSeller(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  // Excluir
  const deleteSellerMutation = useMutation({
    mutationFn: deleteSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });

  return {
    sellers: Array.isArray(sellers) ? sellers : [],
    isLoading,
    error,
    refetch,
    addSeller: addSellerMutation.mutateAsync,
    adding: addSellerMutation.isPending,
    updateSeller: updateSellerMutation.mutateAsync,
    updating: updateSellerMutation.isPending,
    deleteSeller: deleteSellerMutation.mutateAsync,
    deleting: deleteSellerMutation.isPending,
  };
}
