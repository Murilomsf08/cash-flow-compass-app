
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileText, Printer, Copy, Edit, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data - later would come from a real API/database
const initialServices = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250, status: "Pending", seller: "Carlos Silva" },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500, status: "Completed", seller: "Ana Martins" },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120, status: "Cancelled", seller: "João Santos" },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80, status: "Pending", seller: "Maria Souza" },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300, status: "Completed", seller: "Carlos Silva" },
];

// Mock product/service data
const products = [
  { id: 1, name: "Consultoria", value: 2500 },
  { id: 2, name: "Desenvolvimento Web", value: 5000 },
  { id: 3, name: "Design Gráfico", value: 1200 },
  { id: 4, name: "Suporte Técnico", value: 800 },
];

// Mock client data
const clients = [
  { id: 1, name: "Empresa A", email: "contato@empresaa.com" },
  { id: 2, name: "Empresa B", email: "contato@empresab.com" },
  { id: 3, name: "Pessoa C", email: "pessoac@email.com" },
  { id: 4, name: "Pessoa D", email: "pessoad@email.com" },
];

// Mock seller data
const sellers = [
  { id: 1, name: "Carlos Silva" },
  { id: 2, name: "Ana Martins" },
  { id: 3, name: "João Santos" },
  { id: 4, name: "Maria Souza" },
];

const statusOptions = [
  { value: "Pending", label: "Pendente", color: "bg-yellow-500" },
  { value: "Completed", label: "Concluído", color: "bg-green-500" },
  { value: "Cancelled", label: "Cancelado", color: "bg-red-500" },
  { value: "InProgress", label: "Em Progresso", color: "bg-blue-500" },
];

export default function ServicesPage() {
  const { toast } = useToast();
  const [services, setServices] = useState(initialServices);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  
  // Form states
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [lineItems, setLineItems] = useState([{ id: 1, product: "", quantity: 1, unitPrice: 0, total: 0 }]);
  
  // New client form state
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    service.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const handleChangeStatus = (id, newStatus) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, status: newStatus } : service
    ));
    
    toast({
      title: "Status atualizado",
      description: `O status do serviço foi alterado para ${statusOptions.find(opt => opt.value === newStatus)?.label}.`
    });
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems, 
      { 
        id: lineItems.length + 1, 
        product: "", 
        quantity: 1, 
        unitPrice: 0, 
        total: 0 
      }
    ]);
  };

  const handleRemoveLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    } else {
      toast({
        title: "Ação não permitida",
        description: "Pelo menos um item é necessário",
        variant: "destructive"
      });
    }
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If product or quantity changes, update total
        if (field === 'product') {
          const selectedProduct = products.find(p => p.id.toString() === value);
          updatedItem.unitPrice = selectedProduct ? selectedProduct.value : 0;
          updatedItem.total = updatedItem.unitPrice * updatedItem.quantity;
        } else if (field === 'quantity') {
          updatedItem.total = updatedItem.unitPrice * value;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveNewEntry = () => {
    // Validation
    if (!selectedClient || lineItems.some(item => !item.product)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um cliente e produtos para todos os itens.",
        variant: "destructive"
      });
      return;
    }

    // Get client name from selected ID
    const clientName = clients.find(c => c.id.toString() === selectedClient)?.name || "";
    const sellerName = sellers.find(s => s.id.toString() === selectedSeller)?.name || "";

    // Create new service entry
    const newService = {
      id: services.length + 1,
      name: lineItems.map(item => products.find(p => p.id.toString() === item.product)?.name).join(", "),
      client: clientName,
      value: calculateTotal(),
      date: new Date().toISOString().split('T')[0],
      commission: calculateTotal() * 0.10, // Example: 10% commission
      status: "Pending",
      seller: sellerName
    };

    setServices([...services, newService]);
    setIsNewEntryDialogOpen(false);
    
    // Reset form
    setSelectedClient("");
    setSelectedSeller("");
    setLineItems([{ id: 1, product: "", quantity: 1, unitPrice: 0, total: 0 }]);

    toast({
      title: "Serviço registrado",
      description: "O serviço foi adicionado com sucesso."
    });
  };

  const handleSaveNewClient = () => {
    // Validation
    if (!newClient.name) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive"
      });
      return;
    }

    // Add new client to the list
    const newClientEntry = {
      id: clients.length + 1,
      name: newClient.name,
      email: newClient.email,
    };

    // In a real app, this would be an API call
    // For now we're just updating our local mock data
    clients.push(newClientEntry);
    
    // Set the new client as selected
    setSelectedClient(newClientEntry.id.toString());
    
    // Close dialog and reset form
    setIsClientDialogOpen(false);
    setNewClient({ name: "", email: "" });

    toast({
      title: "Cliente cadastrado",
      description: "O cliente foi adicionado com sucesso."
    });
  };

  const handleCloneService = (id) => {
    const serviceToClone = services.find(service => service.id === id);
    if (serviceToClone) {
      const clonedService = {
        ...serviceToClone,
        id: services.length + 1,
        date: new Date().toISOString().split('T')[0],
        status: "Pending"
      };
      
      setServices([...services, clonedService]);
      
      toast({
        title: "Serviço clonado",
        description: "Uma cópia do serviço foi criada com sucesso."
      });
    }
  };

  const handlePrintService = (id) => {
    toast({
      title: "Imprimir serviço",
      description: "Enviando serviço para impressão..."
    });
    // In a real app, this would trigger a print function
  };

  const handleGenerateInvoice = (id) => {
    toast({
      title: "Nota fiscal",
      description: "Gerando nota fiscal..."
    });
    // In a real app, this would trigger an invoice generation
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Serviços" 
        description="Cadastre e visualize os serviços prestados" 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Valor total</h3>
            <p className="text-2xl font-bold">R$ {services.reduce((sum, service) => sum + service.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Quantidade</h3>
            <p className="text-2xl font-bold">{services.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Comissão total</h3>
            <p className="text-2xl font-bold">R$ {services.reduce((sum, service) => sum + service.commission, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Descontos</h3>
            <p className="text-2xl font-bold">R$ 0,00</p>
          </CardContent>
        </Card>
      </div>

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
        <Button onClick={() => setIsNewEntryDialogOpen(true)}>
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
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell>{service.seller || "-"}</TableCell>
                    <TableCell className="text-right">
                      R$ {service.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 p-0">
                            {getStatusBadge(service.status)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Alterar status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {statusOptions.map(option => (
                            <DropdownMenuItem 
                              key={option.value}
                              onClick={() => handleChangeStatus(service.id, option.value)}
                            >
                              <span className={`w-2 h-2 rounded-full ${option.color} mr-2`}></span>
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCloneService(service.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Clonar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintService(service.id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Imprimir</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(service.id)}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Gerar NF</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum serviço encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Registro de Serviço</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente *</Label>
                <div className="flex gap-2">
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client" className="w-full">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seller">Vendedor</Label>
                <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                  <SelectTrigger id="seller">
                    <SelectValue placeholder="Selecione o vendedor (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id.toString()}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">Itens</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Item
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto/Serviço</TableHead>
                      <TableHead className="w-[100px]">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select 
                            value={item.product} 
                            onValueChange={(value) => handleLineItemChange(item.id, 'product', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - R$ {product.value.toFixed(2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {item.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveLineItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-4">
                <div className="space-y-1 text-right">
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-xl font-bold">R$ {calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEntryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNewEntry}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Nome *</Label>
              <Input 
                id="clientName" 
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Email</Label>
              <Input 
                id="clientEmail" 
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNewClient}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
