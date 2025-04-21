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
  DollarSign,
  CreditCard,
  Wallet,
  Coins
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
  { id: 1, description: "Aluguel", category: "Moradia", value: 1200, date: "2025-03-15", paymentMethod: "creditCard" },
  { id: 2, description: "Supermercado", category: "Alimentação", value: 350, date: "2025-03-20", paymentMethod: "money" },
  { id: 3, description: "Conta de Luz", category: "Moradia", value: 180, date: "2025-03-25", paymentMethod: "debitCard" },
  { id: 4, description: "Transporte", category: "Deslocamento", value: 90, date: "2025-04-01", paymentMethod: "money" },
  { id: 5, description: "Restaurante", category: "Lazer", value: 200, date: "2025-04-02", paymentMethod: "creditCard" },
];

// Mock category data
const categories = [
  { id: 1, name: "Moradia" },
  { id: 2, name: "Alimentação" },
  { id: 3, name: "Deslocamento" },
  { id: 4, name: "Lazer" },
  { id: 5, name: "Outros" },
];

// Mock payment method data
const paymentOptions = [
  { id: "money", name: "Dinheiro", icon: DollarSign },
  { id: "creditCard", name: "Cartão de Crédito", icon: CreditCard },
  { id: "debitCard", name: "Cartão de Débito", icon: Wallet },
  { id: "savings", name: "Poupança", icon: Coins },
];

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  
  // Form states
  const [currentExpense, setCurrentExpense] = useState({
    description: "",
    category: "",
    value: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "money",
  });

  // Filter states
  const [filters, setFilters] = useState({
    date: { from: undefined, to: undefined },
    category: "",
    paymentMethod: "",
  });

  // Available filter options
  const [availableFilters, setAvailableFilters] = useState([
    { id: "date", name: "Data", enabled: true, icon: Calendar },
    { id: "category", name: "Categoria", enabled: true, icon: FileText },
    { id: "paymentMethod", name: "Método de Pagamento", enabled: true, icon: CreditCard },
  ]);

  // Filter popup states - Initialize with closed state
  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openPaymentMethodPopover, setOpenPaymentMethodPopover] = useState(false);

  // Summary data
  const [summaryData, setSummaryData] = useState({
    totalValue: 0,
    totalCount: 0,
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter expenses based on current filters
  const filterExpenses = () => {
    return expenses.filter(expense => {
      // Text search filter
      const searchMatch = searchTerm ? 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
      
      // Date filter
      const dateMatch = filters.date.from && filters.date.to ? 
        new Date(expense.date) >= filters.date.from && new Date(expense.date) <= filters.date.to : 
        true;
      
      // Category filter
      const categoryMatch = filters.category ? expense.category === filters.category : true;
      
      // Payment Method filter
      const paymentMethodMatch = filters.paymentMethod ? expense.paymentMethod === filters.paymentMethod : true;
      
      return searchMatch && dateMatch && categoryMatch && paymentMethodMatch;
    });
  };

  const filteredExpenses = filterExpenses();

  // Update summary data based on filtered expenses
  useEffect(() => {
    const totalValue = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0);
    
    setSummaryData({
      totalValue,
      totalCount: filteredExpenses.length,
    });
  }, [filteredExpenses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewEntry = () => {
    // Validation
    if (!currentExpense.description || !currentExpense.category || !currentExpense.value || !currentExpense.date || !currentExpense.paymentMethod) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    // Create new expense entry
    const newExpense = {
      id: expenses.length + 1,
      description: currentExpense.description,
      category: currentExpense.category,
      value: parseFloat(currentExpense.value.toString()), // Convert to string first to avoid TypeScript error
      date: currentExpense.date,
      paymentMethod: currentExpense.paymentMethod,
    };

    setExpenses([...expenses, newExpense]);
    setIsNewEntryDialogOpen(false);
    
    // Reset form
    setCurrentExpense({
      description: "",
      category: "",
      value: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "money",
    });

    toast({
      title: "Despesa registrada",
      description: "A despesa foi adicionada com sucesso."
    });
  };

  const handleCloneExpense = (id) => {
    const expenseToClone = expenses.find(expense => expense.id === id);
    if (expenseToClone) {
      const clonedExpense = {
        ...expenseToClone,
        id: expenses.length + 1,
        date: new Date().toISOString().split('T')[0],
      };
      
      setExpenses([...expenses, clonedExpense]);
      
      toast({
        title: "Despesa clonada",
        description: "Uma cópia da despesa foi criada com sucesso."
      });
    }
  };

  const handlePrintExpense = (id) => {
    toast({
      title: "Imprimir despesa",
      description: "Enviando despesa para impressão..."
    });
    // In a real app, this would trigger a print function
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
      paymentMethod: "",
    });
    
    toast({
      title: "Filtros resetados",
      description: "Todos os filtros foram limpos."
    });
  };

  // Fixed filter handlers to avoid infinite loops
  const updateDateFilter = (dateRange) => {
    setFilters({
      ...filters,
      date: dateRange || { from: undefined, to: undefined }
    });
  };

  const updateCategoryFilter = (categoryName) => {
    setFilters({
      ...filters,
      category: categoryName
    });
    setOpenCategoryPopover(false);
  };

  const updatePaymentMethodFilter = (paymentMethod) => {
    setFilters({
      ...filters,
      paymentMethod: paymentMethod
    });
    setOpenPaymentMethodPopover(false);
  };

  const handlePaymentMethodChange = (paymentMethod) => {
    setCurrentExpense(prev => ({ ...prev, paymentMethod: paymentMethod }));
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Despesas - FinQ" 
        description="Cadastre e visualize as despesas" 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por descrição ou categoria..." 
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
                    onSelect={updateDateFilter}
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
            <Popover 
              open={openCategoryPopover} 
              onOpenChange={setOpenCategoryPopover}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <FileText className="mr-2 h-4 w-4" />
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

          {/* Filter by Payment Method */}
          {availableFilters.find(f => f.id === 'paymentMethod')?.enabled && (
            <Popover
              open={openPaymentMethodPopover}
              onOpenChange={setOpenPaymentMethodPopover}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {filters.paymentMethod ? paymentOptions.find(p => p.id === filters.paymentMethod)?.name || filters.paymentMethod : "Método de Pagamento"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar método..." />
                  <CommandEmpty>Nenhum método encontrado.</CommandEmpty>
                  <CommandGroup>
                    {paymentOptions.map((option) => (
                      <CommandItem
                        key={option.id}
                        onSelect={() => updatePaymentMethodFilter(option.id)}
                        className="flex items-center"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.paymentMethod === option.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <option.icon className="mr-2 h-4 w-4" />
                        <span>{option.name}</span>
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
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Método de Pagamento</TableHead>
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
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">
                      R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {paymentOptions.find(p => p.id === expense.paymentMethod)?.name || expense.paymentMethod}
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
                          <DropdownMenuItem onClick={() => handleCloneExpense(expense.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Clonar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintExpense(expense.id)}>
                            <Printer className="mr-2 h-4 w-4" />
                            <span>Imprimir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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
            <DialogDescription>Adicione uma nova despesa ao registro.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                name="description"
                value={currentExpense.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={currentExpense.category} 
                onValueChange={(value) => setCurrentExpense(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor</Label>
              <Input 
                type="number" 
                id="value" 
                name="value"
                value={currentExpense.value}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input 
                type="date" 
                id="date"
                name="date"
                value={currentExpense.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pagamento</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {paymentOptions.find(option => option.id === currentExpense.paymentMethod)?.name || "Selecione"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Selecione o método</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {paymentOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.id}
                      checked={option.id === currentExpense.paymentMethod}
                      onCheckedChange={() => handlePaymentMethodChange(option.id)}
                    >
                      <option.icon className="mr-2 h-4 w-4" />
                      <span>{option.name}</span>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
