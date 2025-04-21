import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  MoreVertical,
  Filter,
  Calendar, 
  FileText,
  Tags
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Check } from "lucide-react";

const initialExpenses = [
  { 
    id: 1, 
    description: "Aluguel Escritório", 
    category: "Fixo", 
    value: 1500, 
    date: "2025-03-10", 
    status: "Pago", 
    paymentType: "À Vista", 
    installments: { total: 1, current: 1 }
  },
  { 
    id: 2, 
    description: "Internet", 
    category: "Fixo", 
    value: 200, 
    date: "2025-03-12", 
    status: "Pago", 
    paymentType: "À Vista", 
    installments: { total: 1, current: 1 }
  },
  { 
    id: 3, 
    description: "Material de Escritório", 
    category: "Variável", 
    value: 350, 
    date: "2025-03-18", 
    status: "Pendente", 
    paymentType: "À Vista", 
    installments: { total: 1, current: 1 }
  },
  { 
    id: 4, 
    description: "Energia", 
    category: "Fixo", 
    value: 300, 
    date: "2025-03-20", 
    status: "Pago", 
    paymentType: "À Vista", 
    installments: { total: 1, current: 1 }
  },
  { 
    id: 5, 
    description: "Jantar com Cliente", 
    category: "Variável", 
    value: 250, 
    date: "2025-04-01", 
    status: "Pendente", 
    paymentType: "À Vista", 
    installments: { total: 1, current: 1 }
  },
  { 
    id: 6, 
    description: "Notebooks para Equipe", 
    category: "Investimento", 
    value: 1200, 
    date: "2025-04-10", 
    status: "Pago", 
    paymentType: "Parcelado", 
    installments: { total: 4, current: 1 }
  },
  { 
    id: 7, 
    description: "Notebooks para Equipe", 
    category: "Investimento", 
    value: 1200, 
    date: "2025-05-10", 
    status: "Pendente", 
    paymentType: "Parcelado", 
    installments: { total: 4, current: 2 }
  },
  { 
    id: 8, 
    description: "Notebooks para Equipe", 
    category: "Investimento", 
    value: 1200, 
    date: "2025-06-10", 
    status: "Pendente", 
    paymentType: "Parcelado", 
    installments: { total: 4, current: 3 }
  },
  { 
    id: 9, 
    description: "Notebooks para Equipe", 
    category: "Investimento", 
    value: 1200, 
    date: "2025-07-10", 
    status: "Pendente", 
    paymentType: "Parcelado", 
    installments: { total: 4, current: 4 }
  },
];

const initialCategories = ["Fixo", "Variável", "Investimento", "Pessoal", "Impostos"];

const statusOptions = ["Pago", "Pendente", "Cancelado"];

const paymentTypeOptions = ["À Vista", "Parcelado"];

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  
  const [expenseItems, setExpenseItems] = useState([
    { 
      id: 1, 
      description: "", 
      category: "", 
      value: "", 
      date: "", 
      paymentType: "À Vista",
      installments: 1
    }
  ]);
  
  const [filters, setFilters] = useState({
    date: { from: undefined, to: undefined },
    description: "",
    category: "",
    status: ""
  });

  const [availableFilters, setAvailableFilters] = useState([
    { id: "date", name: "Data", enabled: true, icon: Calendar },
    { id: "description", name: "Descrição", enabled: true, icon: FileText },
    { id: "category", name: "Categoria", enabled: true, icon: Tags },
    { id: "status", name: "Status", enabled: true, icon: Tags }
  ]);

  const [openDatePopover, setOpenDatePopover] = useState(false);
  const [openDescriptionPopover, setOpenDescriptionPopover] = useState(false);
  const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
  const [openStatusPopover, setOpenStatusPopover] = useState(false);
  
  const [totalExpensesValue, setTotalExpensesValue] = useState(0);
  const [totalExpensesCount, setTotalExpensesCount] = useState(0);
  
  const handleAddExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      { 
        id: expenseItems.length + 1, 
        description: "", 
        category: "", 
        value: "", 
        date: "",
        paymentType: "À Vista",
        installments: 1
      }
    ]);
  };
  
  const handleRemoveExpenseItem = (id) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter(item => item.id !== id));
    } else {
      toast({
        title: "Aviso",
        description: "Você precisa ter pelo menos um item de despesa.",
        variant: "default"
      });
    }
  };
  
  const handleExpenseItemChange = (id, field, value) => {
    const updatedItems = expenseItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    setExpenseItems(updatedItems);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterExpenses = () => {
    return expenses.filter(expense => {
      const searchMatch = searchTerm ? 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) : 
        true;
      
      const dateMatch = filters.date.from && filters.date.to ? 
        new Date(expense.date) >= filters.date.from && new Date(expense.date) <= filters.date.to : 
        true;
      
      const descriptionMatch = filters.description ? 
        expense.description.toLowerCase().includes(filters.description.toLowerCase()) : 
        true;
      
      const categoryMatch = filters.category ? expense.category === filters.category : true;
      
      const statusMatch = filters.status ? expense.status === filters.status : true;
      
      return searchMatch && dateMatch && descriptionMatch && categoryMatch && statusMatch;
    });
  };

  const filteredExpenses = filterExpenses();

  useEffect(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.value, 0);
    setTotalExpensesValue(total);
    setTotalExpensesCount(filteredExpenses.length);
  }, [filteredExpenses]);

  const handleAddExpenses = () => {
    const invalidItems = expenseItems.filter(
      item => !item.description || !item.category || !item.value || !item.date
    );
    
    if (invalidItems.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios em todos os itens.",
        variant: "destructive"
      });
      return;
    }

    const invalidValues = expenseItems.filter(
      item => isNaN(parseFloat(item.value)) || parseFloat(item.value) <= 0
    );
    
    if (invalidValues.length > 0) {
      toast({
        title: "Valores inválidos",
        description: "O valor da despesa deve ser um número positivo em todos os itens.",
        variant: "destructive"
      });
      return;
    }

    let newExpensesArray = [];

    expenseItems.forEach((item, index) => {
      const baseExpense = {
        id: expenses.length + index + 1,
        description: item.description,
        category: item.category,
        value: parseFloat(item.value),
        date: item.date,
        status: "Pendente",
        paymentType: item.paymentType,
        installments: {
          total: item.paymentType === 'Parcelado' ? parseInt(item.installments) : 1,
          current: 1
        }
      };

      newExpensesArray.push(baseExpense);

      if (item.paymentType === 'Parcelado' && parseInt(item.installments) > 1) {
        for (let i = 2; i <= parseInt(item.installments); i++) {
          const nextDate = new Date(item.date);
          nextDate.setMonth(nextDate.getMonth() + (i - 1));
          
          newExpensesArray.push({
            ...baseExpense,
            id: expenses.length + expenseItems.length + newExpensesArray.length,
            date: nextDate.toISOString().split('T')[0],
            installments: { 
              total: parseInt(item.installments), 
              current: i 
            }
          });
        }
      }
    });

    setExpenses([...expenses, ...newExpensesArray]);
    setIsDialogOpen(false);
    setExpenseItems([
      { 
        id: 1, 
        description: "", 
        category: "", 
        value: "", 
        date: "",
        paymentType: "À Vista",
        installments: 1
      }
    ]);

    toast({
      title: `${newExpensesArray.length > 1 ? 'Despesas registradas' : 'Despesa registrada'}`,
      description: `${newExpensesArray.length > 1 ? 'As despesas foram adicionadas' : 'A despesa foi adicionada'} com sucesso.`
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe um nome para a categoria.",
        variant: "destructive"
      });
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Categoria existente",
        description: "Esta categoria já existe na lista.",
        variant: "destructive"
      });
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    setIsCategoryDialogOpen(false);

    toast({
      title: "Categoria adicionada",
      description: "A categoria foi adicionada com sucesso."
    });
  };

  const handleStatusChange = (id, newStatus) => {
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === id) {
        return { ...expense, status: newStatus };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    
    toast({
      title: "Status atualizado",
      description: `O status da despesa foi alterado para ${newStatus}.`
    });
  };
  
  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    
    if (expenseToDelete.paymentType === 'Parcelado' && expenseToDelete.installments.total > 1) {
      setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
    } else {
      setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
    }
    
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
    
    toast({
      title: "Despesa excluída",
      description: "A despesa foi removida com sucesso."
    });
  };
  
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateExpense = () => {
    if (!editingExpense) return;
    
    setExpenses(expenses.map(expense => 
      expense.id === editingExpense.id ? editingExpense : expense
    ));
    
    setIsEditDialogOpen(false);
    
    toast({
      title: "Despesa atualizada",
      description: "As alterações foram salvas com sucesso."
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
      description: "",
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

  const updateDescriptionFilter = (value) => {
    setFilters({
      ...filters,
      description: value
    });
    setOpenDescriptionPopover(false);
  };

  const updateCategoryFilter = (value) => {
    setFilters({
      ...filters,
      category: value
    });
    setOpenCategoryPopover(false);
  };

  const updateStatusFilter = (value) => {
    setFilters({
      ...filters,
      status: value
    });
    setOpenStatusPopover(false);
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Despesas - FinQ" 
        description="Cadastre e visualize suas despesas" 
      />

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalExpensesValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total de todas as despesas filtradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantidade de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpensesCount}</div>
            <p className="text-xs text-muted-foreground">
              Número total de despesas registradas
            </p>
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

          {availableFilters.find(f => f.id === 'description')?.enabled && (
            <Popover open={openDescriptionPopover} onOpenChange={setOpenDescriptionPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <FileText className="mr-2 h-4 w-4" />
                  {filters.description || "Descrição"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-3" align="start">
                <div className="space-y-3">
                  <Label htmlFor="description-filter">Filtrar por descrição</Label>
                  <Input 
                    id="description-filter" 
                    placeholder="Digite parte da descrição"
                    value={filters.description}
                    onChange={(e) => setFilters({...filters, description: e.target.value})}
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateDescriptionFilter("")}
                    >
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setOpenDescriptionPopover(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {availableFilters.find(f => f.id === 'category')?.enabled && (
            <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10">
                  <Tags className="mr-2 h-4 w-4" />
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
                        key={category}
                        onSelect={() => updateCategoryFilter(category)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.category === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category}
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
                  {filters.status || "Status"}
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
                        key={status}
                        onSelect={() => updateStatusFilter(status)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            filters.status === status ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {status}
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
                <Check className="mr-2 h-4 w-4" />
                <span>Limpar Filtros</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex space-x-2">
            <Button onClick={() => setIsCategoryDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </div>
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
                <TableHead>Status</TableHead>
                <TableHead>Forma de Pgto</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(expense => (
                  <TableRow key={String(expense.id)}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="h-8 p-2">
                            <Badge 
                              variant={
                                expense.status === "Pago" ? "default" : 
                                expense.status === "Pendente" ? "secondary" : "destructive"
                              }
                            >
                              {expense.status}
                            </Badge>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2">
                          <div className="grid gap-2">
                            {statusOptions.map((status) => (
                              <Button 
                                key={status} 
                                variant="ghost" 
                                className="justify-start text-sm"
                                onClick={() => handleStatusChange(expense.id, status)}
                              >
                                {status}
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>{expense.paymentType}</TableCell>
                    <TableCell>
                      {expense.paymentType === "Parcelado" ? (
                        <Badge variant="outline">
                          {expense.installments.current} / {expense.installments.total}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteExpense(expense)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhuma despesa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria de Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para classificar suas despesas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Nome da Categoria *</Label>
              <Input 
                id="category-name" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCategory}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={editingExpense?.description || ""}
                onChange={(e) => setEditingExpense({...editingExpense, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={editingExpense?.category || ""}
                onValueChange={(value) => setEditingExpense({...editingExpense, category: value})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={editingExpense?.value || ""}
                onChange={(e) => setEditingExpense({...editingExpense, value: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={editingExpense?.date || ""}
                onChange={(e) => setEditingExpense({...editingExpense, date: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentType">Forma de Pagamento</Label>
              <Select
                value={editingExpense?.paymentType || "À Vista"}
                onValueChange={(value) => setEditingExpense({...editingExpense, paymentType: value})}
                disabled={editingExpense?.installments?.current > 1}
              >
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingExpense?.paymentType === "Parcelado" && (
              <div className="grid gap-2">
                <Label htmlFor="installments">Parcelas</Label>
                <div className="flex items-center">
                  <span>
                    {editingExpense?.installments?.current} / {editingExpense?.installments?.total}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateExpense}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
              {expenseToDelete?.paymentType === 'Parcelado' && expenseToDelete?.installments?.total > 1 && (
                <p className="mt-2 font-medium text-destructive">
                  Atenção: Esta é uma despesa parcelada. No momento, apenas esta parcela será excluída.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{expenseToDelete?.description}</p>
            <p className="text-muted-foreground">R$ {expenseToDelete?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            {expenseToDelete?.paymentType === 'Parcelado' && (
              <p className="text-muted-foreground">
                Parcela {expenseToDelete?.installments?.current} de {expenseToDelete?.installments?.total}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteExpense}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Despesa</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da despesa. Você pode adicionar múltiplas despesas de uma vez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {expenseItems.map((item, index) => (
              <Card key={String(item.id)} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                  {expenseItems.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveExpenseItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`description-${item.id}`}>Descrição *</Label>
                    <Input 
                      id={`description-${item.id}`}
                      value={item.description}
                      onChange={(e) => handleExpenseItemChange(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`category-${item.id}`}>Categoria *</Label>
                    <Select
                      value={item.category}
                      onValueChange={(value) => handleExpenseItemChange(item.id, 'category', value)}
                    >
                      <SelectTrigger id={`category-${item.id}`}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`value-${item.id}`}>Valor (R$) *</Label>
                    <Input 
                      id={`value-${item.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.value}
                      onChange={(e) => handleExpenseItemChange(item.id, 'value', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`date-${item.id}`}>Data *</Label>
                    <Input 
                      id={`date-${item.id}`}
                      type="date"
                      value={item.date}
                      onChange={(e) => handleExpenseItemChange(item.id, 'date', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`paymentType-${item.id}`}>Forma de Pagamento *</Label>
                    <Select
                      value={item.paymentType}
                      onValueChange={(value) => handleExpenseItemChange(item.id, 'paymentType', value)}
                    >
                      <SelectTrigger id={`paymentType-${item.id}`}>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentTypeOptions.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {item.paymentType === "Parcelado" && (
                    <div className="grid gap-2">
                      <Label htmlFor={`installments-${item.id}`}>Número de Parcelas *</Label>
                      <Input 
                        id={`installments-${item.id}`}
                        type="number"
                        min="2"
                        value={item.installments}
                        onChange={(e) => handleExpenseItemChange(item.id, 'installments', Math.max(2, parseInt(e.target.value) || 2))}
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddExpenseItem}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar Outro Item
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddExpenses}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
