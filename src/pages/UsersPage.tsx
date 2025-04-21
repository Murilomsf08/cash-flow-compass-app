
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, PERMISSIONS, User, UserRole } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

// Mock users data - in a real app this would come from an API
const MOCK_USERS = [
  { id: 1, name: "Admin", email: "admin@finq.com", role: "owner", approved: true },
  { id: 2, name: "Gerente", email: "gerente@finq.com", role: "admin", approved: true },
  { id: 3, name: "Colaborador", email: "colaborador@finq.com", role: "collaborator", approved: true },
  { id: 4, name: "Pendente", email: "pendente@finq.com", role: "collaborator", approved: false },
  { id: 5, name: "Novo Usuário", email: "novo@finq.com", role: "collaborator", approved: false },
];

export default function UsersPage() {
  const { user: currentUser, hasPermission } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setUsers(MOCK_USERS as User[]);
  }, []);

  const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
  const canChangeUserRole = hasPermission(PERMISSIONS.CHANGE_USER_ROLE);
  const canApproveUser = hasPermission(PERMISSIONS.APPROVE_USER);
  
  const handleRoleChange = (userId: number, newRole: UserRole) => {
    if (!canChangeUserRole) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para alterar perfis de usuário.",
        variant: "destructive",
      });
      return;
    }

    // Don't allow changing owner's role
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === "owner") {
      toast({
        title: "Ação não permitida",
        description: "Não é possível alterar o perfil do proprietário.",
        variant: "destructive",
      });
      return;
    }

    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      )
    );
    
    toast({
      title: "Perfil alterado",
      description: `O perfil do usuário foi alterado para ${newRole === "admin" ? "Administrador" : "Colaborador"}.`,
    });
  };

  const openApproveDialog = (user: User) => {
    setSelectedUser(user);
    setIsApproveDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleApproveUser = () => {
    if (!selectedUser) return;
    
    setUsers(currentUsers =>
      currentUsers.map(u =>
        u.id === selectedUser.id ? { ...u, approved: true } : u
      )
    );
    
    toast({
      title: "Usuário aprovado",
      description: `O acesso de ${selectedUser.name} foi aprovado.`,
    });
    
    setIsApproveDialogOpen(false);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    // Don't allow deleting owner
    if (selectedUser.role === "owner") {
      toast({
        title: "Ação não permitida",
        description: "Não é possível excluir o proprietário.",
        variant: "destructive",
      });
      return;
    }
    
    setUsers(currentUsers =>
      currentUsers.filter(u => u.id !== selectedUser.id)
    );
    
    toast({
      title: "Usuário excluído",
      description: `O usuário ${selectedUser.name} foi excluído.`,
    });
    
    setIsDeleteDialogOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerenciamento de usuários e permissões"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {canChangeUserRole && user.role !== "owner" && currentUser?.id !== user.id ? (
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value: string) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue>
                            {user.role === "owner"
                              ? "Proprietário"
                              : user.role === "admin"
                              ? "Administrador"
                              : "Colaborador"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {/* Don't allow changing to owner */}
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="collaborator">Colaborador</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span>
                        {user.role === "owner"
                          ? "Proprietário"
                          : user.role === "admin"
                          ? "Administrador"
                          : "Colaborador"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" /> Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!user.approved && canApproveUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApproveDialog(user)}
                        >
                          Aprovar
                        </Button>
                      )}
                      {user.id !== currentUser?.id && user.role !== "owner" && canManageUsers && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve User Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar o acesso para {selectedUser?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveUser}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o usuário {selectedUser?.name}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
