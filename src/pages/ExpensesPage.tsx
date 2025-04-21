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

// Mock data - later would come from a real API/database
const initialExpenses = [
  { id: 1, name: "Aluguel", category: "Moradia", value: 1200, date: "2025-03-15", installments: 1, paid: true, description: "Aluguel do apartamento" },
  { id: 2, name: "Supermercado", category: "Alimentação", value: 500, date: "2025-03-20", installments: 1, paid: true, description: "Compras do mês" },
  { id: 3, name: "Conta de Luz", category: "Moradia", value: 150, date: "2025-03-25", installments: 1, paid: false, description: "Conta de luz do apartamento" },
  { id: 4, name: "Mensalidade da Faculdade", category: "Educação", value: 800, date: "2025-04-01", installments: 12, paid: false, description: "Mensalidade da faculdade" },
  { id: 5, name: "Restaurante", category: "Lazer", value: 100, date: "2025-04-02", installments: 1, paid: true, description: "Almoço no restaurante" },
];

// Mock category data
const categories = [
  { id: 1, name: "Moradia" },
  { id: 2, name: "Alimentação" },
  { id: 3, name: "Educação" },
  { id: 4, name: "Lazer" },
  { id: 5, name: "Transporte" },
];

const statusOptions = [
  { value: true, label: "Pago", color: "bg-green-500" },
  { value: false, label: "Pendente", color: "bg-red-500" },
];

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  
  // Form states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [installments, setInstallments] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    date: { from: undefined, to: undefined },
    category: "",
    status: "",
  });

  // Available filter options
  const [availableFilters, setAvailableFilters] = useState([
    { id: "date", name: "Data", enabled: true, icon: Calendar },
    { id: "category", name: "Categoria", enabled: true, icon: ShoppingBag },
    { id: "status", name: "Status", enabled: true, icon: Tags },
  ]);

  // Filter popup states
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openStatusPopover, setOpenStatusPopover] = useState(false);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    totalCount: 0,
    totalPaid: 0,
    totalPending: 0
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter expenses based on current filters
  const filterExpenses = () => {
    return expenses.filter(expense => {
      // Text search filter
      const searchMatch = searchTerm ? 
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
      
      // Date filter
      const dateMatch = filters.date.from && filters.date.to ? 
        new Date(expense.date) >= filters.date.from && new Date(expense.date) <= filters.date.to : 
        true;
      
      // Category filter
      const categoryMatch = filters.category ? expense.category === filters.category : true;
      
      // Status filter
      const statusMatch = filters.status !== "" ? expense.paid === (filters.status === "true") : true;
      
      return searchMatch && dateMatch && categoryMatch && statusMatch;
    });
  };

  const filteredExpenses = filterExpenses();

  // Update summary data based on filtered expenses
  useEffect(() => {
    const totalValue = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0);
    const totalPaid = filteredExpenses.filter(expense => expense.paid).length;
    const totalPending = filteredExpenses.filter(expense => !expense.paid).length;
    
    setSummaryData({
      totalValue,
      totalCount: filteredExpenses.length,
      totalPaid,
      totalPending
    });
  }, [filteredExpenses]);

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const handleChangeStatus = (id, newStatus) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, paid: newStatus } : expense
    ));
    
    toast({
      title: "Status atualizado",
      description: `O status da despesa foi alterado para ${statusOptions.find(opt => opt.value === newStatus)?.label}.`
    });
  };

  const handleSaveNewEntry = () => {
    // Validation
    if (!selectedCategory) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive"
      });
      return;
    }

    // Create new expense entry for each installment
    for (let i = 0; i < installments; i++) {
      const newExpense = {
        id: expenses.length + 1 + i,
        name: "Nova Despesa",
        category: categories.find(c => c.id.toString() === selectedCategory)?.name || "",
        value: 100,
        date: new Date().toISOString().split('T')[0],
        installments: installments,
        paid: false,
        description: `Mês ${i + 1} de ${installments.toString()}`
      };

      setExpenses(prevExpenses => [...prevExpenses, newExpense]);
    }
    
    setIsNewEntryDialogOpen(false);
    
    // Reset form
    setSelectedCategory("");
    setInstallments(1);

    toast({
      title: "Despesa registrada",
      description: "A despesa foi adicionada com sucesso."
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
      category: "",
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

  const updateCategoryFilter = (categoryName) => {
    setFilters({
      ...filters,
      category: categoryName
    });
    setOpenCategoryPopover(false);
  };

  const updateStatusFilter = (statusValue) => {
    setFilters({
      ...filters,
      status: statusValue
    });
    setOpenStatusPopover(false);
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Despesas - FinQ" 
        description="Cadastre e visualize as despesas" 
      />

      {/* Summary Cards */}
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
            <h3 className="text-sm font-medium text-muted-foreground">Total Pago</h3>
            <p className="text-2xl font-bold">{summaryData.totalPaid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Pendente</h3>
            <p className="text-2xl font-bold">{summaryData.totalPending}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome ou descrição..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filter by Date */}
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

          {/* Filter by Category */}
          {availableFilters.find(f => f.id === 'category')?.enabled && (
            <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {filters.category || "Categoria"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar categoria..." />
                  <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => updateCategoryFilter("")}
                      className="flex items-center"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !filters.category ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>Todas</span>
                    </CommandItem>
                    {categories.map((category) => (
                      <CommandItem
                        key={category.id}
                        onSelect={() => updateCategoryFilter(category.name)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.category === category.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Filter by Status */}
          {availableFilters.find(f => f.id === 'status')?.enabled && (
            <Popover open={openStatusPopover} onOpenChange={setOpenStatusPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Tags className="mr-2 h-4 w-4" />
                  {filters.status ? statusOptions.find(s => s.value.toString() === filters.status)?.label || "Status" : "Status"}
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
                    {statusOptions.map((status) => (
                      <CommandItem
                        key={status.value}
                        onSelect={() => updateStatusFilter(status.value.toString())}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.status === status.value.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full ${status.color} mr-2`}></span>
                          {status.label}
                        </div>
                      </CommandItem>
                    ))}
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
            <Plus className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{expense.name}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 p-0">
                            {getStatusBadge(expense.paid)}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Alterar status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {statusOptions.map(option => (
                            <DropdownMenuItem 
                              key={option.value}
                              onClick={() => handleChangeStatus(expense.id, option.value)}
                            >
                              <span className={`w-2 h-2 rounded-full ${option.color} mr-2`}></span>
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Imprimir</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Gerar Boleto</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhuma despesa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Input 
                id="installments" 
                type="number"
                min="1"
                value={installments.toString()}
                onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewEntryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNewEntry}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
