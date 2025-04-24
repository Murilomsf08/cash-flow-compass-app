
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ChevronsUpDown, 
  MoreVertical,
  Filter,
  Calendar,
  Users,
  ShoppingBag,
  Tags
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { useSellers } from "@/hooks/useSellers";

// Define a safe clients array to avoid undefined issues
const clients = [
  { id: 1, name: "Empresa A", email: "contato@empresaa.com" },
  { id: 2, name: "Empresa B", email: "contato@empresab.com" },
  { id: 3, name: "Pessoa C", email: "pessoac@email.com" },
  { id: 4, name: "Pessoa D", email: "pessoad@email.com" },
];

const statusOptions = [
  { value: "Pending", label: "Pendente", color: "bg-yellow-500" },
  { value: "Completed", label: "Concluído", color: "bg-green-500" },
  { value: "Cancelled", label: "Cancelado", color: "bg-red-500" },
  { value: "InProgress", label: "Em Progresso", color: "bg-blue-500" },
];

export default function ServicesPage() {
  const { toast } = useToast();
  const { services = [], isLoading: loadingServices, addService, toggleStatus } = useServices();
  const { products = [], isLoading: loadingProducts } = useProducts();
  const { sellers = [], isLoading: loadingSellers } = useSellers();

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedSeller, setSelectedSeller] = useState("");
  const [lineItems, setLineItems] = useState([{ id: 1, product: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const [openSellerCombobox, setOpenSellerCombobox] = useState(false);
  
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
  });

  const [filters, setFilters] = useState({
    date: { from: undefined, to: undefined },
    client: "",
    seller: "",
    product: "",
    status: "",
  });

  const [availableFilters, setAvailableFilters] = useState([
    { id: "date", name: "Data", enabled: true, icon: Calendar },
    { id: "client", name: "Cliente", enabled: true, icon: Users },
    { id: "seller", name: "Vendedor", enabled: true, icon: Users },
    { id: "product", name: "Produto/Serviço", enabled: true, icon: ShoppingBag },
    { id: "status", name: "Status", enabled: true, icon: Tags },
  ]);

  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [openClientFilterPopover, setOpenClientFilterPopover] = useState(false);
  const [openSellerFilterPopover, setOpenSellerFilterPopover] = useState(false);
  const [openProductPopover, setOpenProductPopover] = useState(false);
  const [openStatusPopover, setOpenStatusPopover] = useState(false);

  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    totalCount: 0,
    totalCommission: 0,
    discounts: 0
  });

  // Ensure arrays are always arrays, not undefined
  const servicesArray = Array.isArray(services) ? services : [];
  const productsArray = Array.isArray(products) ? products : [];
  const sellersArray = Array.isArray(sellers) ? sellers : [];

  // Create safe references for all arrays used in iterative components
  const renderClientsList = clients || [];
  const renderSellersArray = sellersArray || [];
  const renderProductsArray = productsArray || [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterServices = () => {
    // Make sure we're always working with an array
    return (servicesArray || []).filter(service => {
      if (!service) return false;
      
      const searchMatch = searchTerm ? 
        (service.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
        (service.client?.toLowerCase() || "").includes(searchTerm.toLowerCase()) : 
        true;
      
      const dateMatch = filters.date?.from && filters.date?.to ? 
        new Date(service.date) >= filters.date.from && new Date(service.date) <= filters.date.to : 
        true;
      
      const clientMatch = filters.client ? service.client === filters.client : true;
      
      const sellerMatch = filters.seller ? service.seller === filters.seller : true;
      
      const productMatch = filters.product ? service.name === filters.product : true;
      
      const statusMatch = filters.status ? service.status === filters.status : true;
      
      return searchMatch && dateMatch && clientMatch && sellerMatch && productMatch && statusMatch;
    });
  };

  const filteredServices = filterServices();

  useEffect(() => {
    // Double check that filteredServices is an array
    if (!Array.isArray(filteredServices)) {
      console.error("filteredServices não é um array:", filteredServices);
      return;
    }

    const totalValue = filteredServices.reduce((sum, service) => sum + (service?.value || 0), 0);
    const totalCommission = filteredServices.reduce((sum, service) => sum + (service?.commission || 0), 0);
    
    setSummaryData({
      totalValue,
      totalCount: filteredServices.length,
      totalCommission,
      discounts: 0
    });
  }, [filteredServices]);

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (!statusOption) return null;
    
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await toggleStatus({ id, newStatus });
      
      toast({
        title: "Status atualizado",
        description: `O status do serviço foi alterado para ${statusOptions.find(opt => opt.value === newStatus)?.label}.`
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status. Tente novamente.",
        variant: "destructive"
      });
    }
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
        
        if (field === 'product') {
          const productsArray = Array.isArray(products) ? products : [];
          const selectedProduct = productsArray.find(p => p && p.id && p.id.toString() === value);
          updatedItem.unitPrice = selectedProduct ? selectedProduct.price : 0;
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

  const handleSaveNewEntry = async () => {
    if (!selectedClient || lineItems.some(item => !item.product)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione um cliente e produtos para todos os itens.",
        variant: "destructive"
      });
      return;
    }

    try {
      const clientName = clients.find(c => c && c.id && c.id.toString() === selectedClient)?.name || "";
      const sellerName = (Array.isArray(sellers) ? sellers : []).find(s => s && s.id && s.id.toString() === selectedSeller)?.name || "";
      const total = calculateTotal();
      
      const newService = {
        name: lineItems.map(item => {
          const productsArray = Array.isArray(products) ? products : [];
          return productsArray.find(p => p && p.id && p.id.toString() === item.product)?.name;
        }).filter(Boolean).join(", "),
        client: clientName,
        value: total,
        date: new Date().toISOString().split('T')[0],
        commission: total * 0.10,
        status: "Pending",
        seller: sellerName || undefined
      };

      await addService(newService);
      setIsNewEntryDialogOpen(false);
      
      setSelectedClient("");
      setSelectedSeller("");
      setLineItems([{ id: 1, product: "", quantity: 1, unitPrice: 0, total: 0 }]);

      toast({
        title: "Serviço registrado",
        description: "O serviço foi adicionado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      toast({
        title: "Erro ao registrar serviço",
        description: "Ocorreu um erro ao registrar o serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSaveNewClient = () => {
    if (!newClient.name) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive"
      });
      return;
    }

    const newClientEntry = {
      id: clients.length + 1,
      name: newClient.name,
      email: newClient.email,
    };

    clients.push(newClientEntry);
    
    setSelectedClient(newClientEntry.id.toString());
    
    setIsClientDialogOpen(false);
    setNewClient({ name: "", email: "" });

    toast({
      title: "Cliente cadastrado",
      description: "O cliente foi adicionado com sucesso."
    });
  };

  const handleCloneService = async (serviceToClone) => {
    try {
      if (serviceToClone) {
        const { id, ...serviceData } = serviceToClone;
        
        const clonedService = {
          ...serviceData,
          date: new Date().toISOString().split('T')[0],
          status: "Pending"
        };
        
        await addService(clonedService);
        
        toast({
          title: "Serviço clonado",
          description: "Uma cópia do serviço foi criada com sucesso."
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao clonar serviço",
        description: "Ocorreu um erro ao clonar o serviço. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePrintService = (id) => {
    toast({
      title: "Imprimir serviço",
      description: "Enviando serviço para impressão..."
    });
  };

  const handleGenerateInvoice = (id) => {
    toast({
      title: "Nota fiscal",
      description: "Gerando nota fiscal..."
    });
  };

  const handleToggleFilter = (filterId) => {
    setAvailableFilters(availableFilters.map(filter => 
      filter.id === filterId ? { ...filter, enabled: !filter.enabled } : filter
    ));
  };

  const resetFilters = () => {
    setFilters({
      date: { from: undefined, to: undefined },
      client: "",
      seller: "",
      product: "",
      status: ""
    });
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram limpos."
    });
  };

  const updateDateFilter = (dateRange) => {
    setFilters({
      ...filters,
      date: dateRange
    });
    setOpenDatePopover(false);
  };

  const updateClientFilter = (clientName) => {
    setFilters({
      ...filters,
      client: clientName
    });
    setOpenClientFilterPopover(false);
  };

  const updateSellerFilter = (sellerName) => {
    setFilters({
      ...filters,
      seller: sellerName
    });
    setOpenSellerFilterPopover(false);
  };

  const updateProductFilter = (productName) => {
    setFilters({
      ...filters,
      product: productName
    });
    setOpenProductPopover(false);
  };

  const updateStatusFilter = (statusValue) => {
    setFilters({
      ...filters,
      status: statusValue
    });
    setOpenStatusPopover(false);
  };

  if (loadingServices || loadingProducts || loadingSellers) {
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Registro de Serviços - FinQ" 
        description="Cadastre e visualize os serviços prestados" 
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Valor total</h3>
            <p className="text-2xl font-bold">R$ {summaryData.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Quantidade</h3>
            <p className="text-2xl font-bold">{summaryData.totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Comissão total</h3>
            <p className="text-2xl font-bold">R$ {summaryData.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Descontos</h3>
            <p className="text-2xl font-bold">R$ {summaryData.discounts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou cliente..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {availableFilters.find(f => f.id === 'date')?.enabled && (
            <Popover open={openDatePopover} onOpenChange={setOpenDatePopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.date.from && filters.date.to ? 
                    `${format(filters.date.from, 'dd/MM/yyyy')} - ${format(filters.date.to, 'dd/MM/yyyy')}` : 
                    "Filtrar por data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: filters.date.from,
                      to: filters.date.to
                    }}
                    onSelect={(range) => updateDateFilter(range || { from: undefined, to: undefined })}
                    numberOfMonths={1}
                    className="p-3 pointer-events-auto"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateDateFilter({ from: undefined, to: undefined })}
                    >
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setOpenDatePopover(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {availableFilters.find(f => f.id === 'client')?.enabled && (
            <Popover open={openClientFilterPopover} onOpenChange={setOpenClientFilterPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Users className="mr-2 h-4 w-4" />
                  {filters.client || "Cliente"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar cliente..." />
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => updateClientFilter("")}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.client ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>Todos</span>
                    </CommandItem>
                    {renderClientsList && renderClientsList.map((client) => (
                      <CommandItem
                        key={client.id}
                        onSelect={() => updateClientFilter(client.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.client === client.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {availableFilters.find(f => f.id === 'seller')?.enabled && (
            <Popover open={openSellerFilterPopover} onOpenChange={setOpenSellerFilterPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Users className="mr-2 h-4 w-4" />
                  {filters.seller || "Vendedor"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar vendedor..." />
                  <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => updateSellerFilter("")}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.seller ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>Todos</span>
                    </CommandItem>
                    {renderSellersArray && renderSellersArray.map((seller) => (
                      <CommandItem
                        key={seller.id}
                        onSelect={() => updateSellerFilter(seller.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.seller === seller.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {seller.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {availableFilters.find(f => f.id === 'product')?.enabled && (
            <Popover open={openProductPopover} onOpenChange={setOpenProductPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {filters.product || "Produto/Serviço"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar produto..." />
                  <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => updateProductFilter("")}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.product ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>Todos</span>
                    </CommandItem>
                    {renderProductsArray && renderProductsArray.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => updateProductFilter(product.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.product === product.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {availableFilters.find(f => f.id === 'status')?.enabled && (
            <Popover open={openStatusPopover} onOpenChange={setOpenStatusPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Tags className="mr-2 h-4 w-4" />
                  {filters.status ? statusOptions.find(s => s.value === filters.status)?.label || filters.status : "Status"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar status..." />
                  <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => updateStatusFilter("")}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.status ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>Todos</span>
                    </CommandItem>
                    {statusOptions && statusOptions.length > 0 ? statusOptions.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => updateStatusFilter(status.value)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.status === status.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full ${status.color} mr-2`}></span>
                          {status.label}
                        </div>
                      </CommandItem>
                    )) : null}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Mais Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Personalizar Filtros</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableFilters.map((filter) => (
                <DropdownMenuCheckboxItem
                  key={filter.id}
                  checked={filter.enabled}
                  onCheckedChange={() => handleToggleFilter(filter.id)}
                >
                  <filter.icon className="mr-2 h-4 w-4" />
                  <span>{filter.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                <span>Limpar Filtros</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setIsNewEntryDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Serviço
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
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
              {filteredServices && filteredServices.length > 0 ? (
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
                          {statusOptions && statusOptions.map(option => (
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
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCloneService(service)}>
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

      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Registro de Serviço</DialogTitle>
            <DialogDescription>Cadastre um novo serviço prestado para um cliente.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Cliente *</Label>
                <div className="flex gap-2">
                  <Popover open={openClientCombobox} onOpenChange={setOpenClientCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClientCombobox}
                        className="w-full justify-between"
                      >
                        {selectedClient && renderClientsList
                          ? renderClientsList.find((client) => client?.id?.toString() === selectedClient)?.name || "Selecione o cliente"
                          : "Selecione o cliente"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cliente..." />
                        <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {renderClientsList && renderClientsList.map((client) => (
                            <CommandItem
                              key={client.id}
                              value={client.name}
                              onSelect={() => {
                                setSelectedClient(client.id.toString());
                                setOpenClientCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClient === client.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {client.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button type="button" variant="outline" onClick={() => setIsClientDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seller">Vendedor</Label>
                <Popover open={openSellerCombobox} onOpenChange={setOpenSellerCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSellerCombobox}
                      className="w-full justify-between"
                    >
                      {selectedSeller && renderSellersArray
                        ? renderSellersArray.find((seller) => seller?.id?.toString() === selectedSeller)?.name || "Selecione o vendedor (opcional)"
                        : "Selecione o vendedor (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar vendedor..." />
                      <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
                      <CommandGroup>
                        {renderSellersArray && renderSellersArray.length > 0 ? renderSellersArray.map((seller) => (
                          <CommandItem
                            key={seller.id}
                            value={seller.name}
                            onSelect={() => {
                              setSelectedSeller(seller.id.toString());
                              setOpenSellerCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedSeller === seller.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {seller.name}
                          </CommandItem>
                        )) : (
                          <CommandItem>Nenhum vendedor disponível</CommandItem>
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                              {renderProductsArray.length > 0 && renderProductsArray.map(product => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - R$ {product.price?.toFixed(2) || "0.00"}
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

      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <DialogDescription>Preencha os dados para cadastrar um novo cliente.</DialogDescription>
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
