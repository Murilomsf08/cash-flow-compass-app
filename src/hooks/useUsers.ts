
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUser, deleteUser } from "@/services/usersService";
import { User, UserRole } from "@/contexts/AuthContext";

export function useUsers() {
  const queryClient = useQueryClient();

  // Listar usuários
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: ({ 
      id, 
      role, 
      approved 
    }: { 
      id: number; 
      role?: UserRole; 
      approved?: boolean;
    }) => updateUser(id, { role, approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Excluir usuário
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUser: updateUserMutation.mutateAsync,
    updating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutateAsync,
    deleting: deleteUserMutation.isPending,
  };
}
