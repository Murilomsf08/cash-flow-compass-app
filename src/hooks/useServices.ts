
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from "@/services/servicesService";
import type { ServiceDB } from '@/services/types/serviceTypes';
import { toast } from "@/hooks/use-toast";
import { validateSupabaseConnection } from "@/services/config/supabaseConfig";

export function useServices() {
  const queryClient = useQueryClient();

  // Validar conexão com Supabase
  const { data: isConnected } = useQuery({
    queryKey: ["supabase-connection"],
    queryFn: validateSupabaseConnection,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Listar serviços
  const {
    data: services = [],
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
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar serviço",
        description: error.message || "Ocorreu um erro ao adicionar o serviço.",
        variant: "destructive",
      });
    },
  });

  // Editar serviço
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) =>
      updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: error.message || "Ocorreu um erro ao atualizar o serviço.",
        variant: "destructive",
      });
    },
  });

  // Excluir
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir serviço",
        description: error.message || "Ocorreu um erro ao excluir o serviço.",
        variant: "destructive",
      });
    },
  });

  // Alterar status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      toggleServiceStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro ao alterar o status do serviço.",
        variant: "destructive",
      });
    },
  });

  // Ensure services is always an array
  const safeServices = Array.isArray(services) ? services : [];

  return {
    services: safeServices,
    isLoading,
    error,
    refetch,
    isConnected,
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
