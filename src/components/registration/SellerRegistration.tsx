
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSellers } from "@/hooks/useSellers";

export default function SellerRegistration() {
  const { toast } = useToast();
  const { 
    sellers,
    isLoading,
    error,
    refetch,
    addSeller,
    updateSeller,
    deleteSeller
  } = useSellers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    commission: ""
  });

  useEffect(() => {
    // Forçar o carregamento dos dados ao montar o componente
    refetch();
  }, [refetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredSellers = sellers?.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    seller.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddSeller = async () => {
    // Form validation
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    // Validate commission
    const commission = parseFloat(formData.commission || "0");
    if (isNaN(commission) || commission < 0 || commission > 100) {
      toast({
        title: "Comissão inválida",
        description: "A comissão deve ser um número entre 0 e 100.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditMode && currentSellerId !== null) {
        // Update existing seller
        await updateSeller({
          id: currentSellerId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          commission: commission
        });
        
        toast({
          title: "Vendedor atualizado",
          description: "As informações do vendedor foram atualizadas com sucesso."
        });
      } else {
        // Add new seller
        await addSeller({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          commission: commission
        });
        
        toast({
          title: "Vendedor registrado",
          description: "O vendedor foi adicionado com sucesso."
        });
      }

      // Reset form and close dialog
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o vendedor.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (seller: any) => {
    setFormData({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || "",
      commission: seller.commission.toString()
    });
    setCurrentSellerId(seller.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSeller(id);
      toast({
        title: "Vendedor removido",
        description: "O vendedor foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao remover o vendedor.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      commission: ""
    });
    setIsEditMode(false);
    setCurrentSellerId(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou email..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Vendedor
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Carregando vendedores...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              Erro ao carregar dados. Por favor, tente novamente.
              <Button 
                variant="outline" 
                className="mt-2 mx-auto block"
                onClick={() => refetch()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Comissão (%)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSellers.length > 0 ? (
                  filteredSellers.map(seller => (
                    <TableRow key={seller.id}>
                      <TableCell>{seller.name}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>{seller.phone}</TableCell>
                      <TableCell className="text-right">{seller.commission}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(seller)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(seller.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum vendedor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Vendedor" : "Adicionar Vendedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input 
                id="commission" 
                name="commission" 
                type="number"
                min="0"
                max="100"
                value={formData.commission}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleAddSeller}>
              {isEditMode ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
