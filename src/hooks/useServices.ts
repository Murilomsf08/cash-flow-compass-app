
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  toggleServiceStatus,
  ServiceDB,
} from "@/services/servicesService";

export function useServices() {
  const queryClient = useQueryClient();

  // Listar serviços
  const {
    data: services = [], // Garantir que data seja sempre um array, mesmo que undefined
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    retry: 2, // Tenta buscar os dados 2 vezes em caso de erro
    refetchOnWindowFocus: true, // Recarrega os dados quando o foco volta para a janela
    refetchOnMount: true, // Recarrega os dados quando o componente é montado
  });

  // Adicionar serviço
  const addServiceMutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // Editar serviço
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // Excluir
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  // Alterar status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      toggleServiceStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    services,
    isLoading,
    error,
    refetch,
    addService: addServiceMutation.mutateAsync,
    adding: addServiceMutation.isPending,
    updateService: updateServiceMutation.mutateAsync,
    updating: updateServiceMutation.isPending,
    deleteService: deleteServiceMutation.mutateAsync,
    deleting: deleteServiceMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    toggling: toggleStatusMutation.isPending,
  };
}
