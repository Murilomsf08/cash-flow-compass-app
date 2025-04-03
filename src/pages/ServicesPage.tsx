
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
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
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Mock data (later would come from a real API/database)
const initialServices = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250 },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500 },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120 },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80 },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300 },
];

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [newService, setNewService] = useState({
    name: "",
    client: "",
    value: "",
    date: "",
    commission: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    service.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = () => {
    // Form validation
    if (!newService.name || !newService.client || !newService.value || !newService.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const value = parseFloat(newService.value);
    let commission = parseFloat(newService.commission || "0");

    if (isNaN(value) || value <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor do serviço deve ser um número positivo.",
        variant: "destructive"
      });
      return;
    }

    // Add new service
    const newServiceData = {
      id: services.length + 1,
      name: newService.name,
      client: newService.client,
      value: value,
      date: newService.date,
      commission: isNaN(commission) ? 0 : commission
    };

    setServices([...services, newServiceData]);
    setIsDialogOpen(false);
    setNewService({
      name: "",
      client: "",
      value: "",
      date: "",
      commission: ""
    });

    toast({
      title: "Serviço registrado",
      description: "O serviço foi adicionado com sucesso."
    });
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Serviços" 
        description="Cadastre e visualize os serviços prestados" 
      />

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou cliente..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <TableRow key={service.id}>
                    <TableCell>
                      {new Date(service.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.client}</TableCell>
                    <TableCell className="text-right">
                      R$ {service.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {service.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input 
                id="name" 
                name="name" 
                value={newService.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client">Cliente *</Label>
              <Input 
                id="client" 
                name="client" 
                value={newService.client}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input 
                id="value" 
                name="value" 
                type="number"
                value={newService.value}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input 
                id="date" 
                name="date" 
                type="date"
                value={newService.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="commission">Comissão (R$)</Label>
              <Input 
                id="commission" 
                name="commission" 
                type="number"
                value={newService.commission}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddService}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
