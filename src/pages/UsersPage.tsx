import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole } from "@/contexts/AuthContext";

// Mock user data - in a real app, this would come from an API
const MOCK_USERS: User[] = [
  { id: 1, name: "Admin", email: "admin@finq.com", role: "owner", approved: true },
  { id: 2, name: "Gerente", email: "gerente@finq.com", role: "admin", approved: true },
  { id: 3, name: "Colaborador", email: "colaborador@finq.com", role: "collaborator", approved: true },
  { id: 4, name: "Pendente", email: "pendente@finq.com", role: "collaborator", approved: false },
  { id: 5, name: "João Silva", email: "joao@finq.com", role: "collaborator", approved: true },
  { id: 6, name: "Maria Souza", email: "maria@finq.com", role: "collaborator", approved: false },
];

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("collaborator");
  const [approvalStatus, setApprovalStatus] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call
    setUsers(MOCK_USERS);
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setApprovalStatus(user.approved);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    // In a real app, this would be an API call
    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? { ...user, role: selectedRole, approved: approvalStatus }
        : user
    );

    setUsers(updatedUsers);
    setIsEditDialogOpen(false);

    toast({
      title: "Usuário atualizado",
      description: `As alterações para ${selectedUser.name} foram salvas.`,
    });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "owner":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Proprietário
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Administrador
          </Badge>
        );
      case "collaborator":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Colaborador
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Desconhecido
          </Badge>
        );
    }
  };

  const getStatusBadge = (approved: boolean) => {
    return approved ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
        Ativo
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
        Pendente
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.approved)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={user.role === "owner" as UserRole}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <div className="col-span-3">
                <p className="text-sm font-medium">{selectedUser?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <div className="col-span-3">
                <p className="text-sm font-medium">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as UserRole)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={approvalStatus ? "approved" : "pending"}
                onValueChange={(value) => setApprovalStatus(value === "approved")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
