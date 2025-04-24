import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productsService";
import { ProductDB } from "@/services/types/productTypes";

export function useProducts() {
  const queryClient = useQueryClient();

  // Listar produtos
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    retry: 2, // Tenta buscar os dados 2 vezes em caso de erro
    refetchOnWindowFocus: true, // Recarrega os dados quando o foco volta para a janela
    refetchOnMount: true, // Recarrega os dados quando o componente é montado
  });

  // Adicionar produto
  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Editar produto
  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Excluir
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products: Array.isArray(products) ? products : [],
    isLoading,
    error,
    refetch,
    addProduct: addProductMutation.mutateAsync,
    adding: addProductMutation.isPending,
    updateProduct: updateProductMutation.mutateAsync,
    updating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutateAsync,
    deleting: deleteProductMutation.isPending,
  };
}
