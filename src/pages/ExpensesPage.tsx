
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
import { Plus, Search, Edit, Trash, Plus as AddIcon, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data (later would come from a real API/database)
const initialExpenses = [
  { id: 1, description: "Aluguel Escritório", category: "Fixo", value: 1500, date: "2025-03-10", status: "Pago" },
  { id: 2, description: "Internet", category: "Fixo", value: 200, date: "2025-03-12", status: "Pago" },
  { id: 3, description: "Material de Escritório", category: "Variável", value: 350, date: "2025-03-18", status: "Pendente" },
  { id: 4, description: "Energia", category: "Fixo", value: 300, date: "2025-03-20", status: "Pago" },
  { id: 5, description: "Jantar com Cliente", category: "Variável", value: 250, date: "2025-04-01", status: "Pendente" },
];

// Initial categories list
const initialCategories = ["Fixo", "Variável", "Investimento", "Pessoal", "Impostos"];

// Status options
const statusOptions = ["Pago", "Pendente", "Cancelado"];

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
  const [totalExpensesValue, setTotalExpensesValue] = useState(0);
  const [totalExpensesCount, setTotalExpensesCount] = useState(0);
  
  // Multiple expenses management
  const [expenseItems, setExpenseItems] = useState([
    { id: 1, description: "", category: "", value: "", date: "" }
  ]);
  
  const handleAddExpenseItem = () => {
    setExpenseItems([
      ...expenseItems,
      { 
        id: expenseItems.length + 1, 
        description: "", 
        category: "", 
        value: "", 
        date: "" 
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

  // Calculate totals
  useEffect(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.value, 0);
    setTotalExpensesValue(total);
    setTotalExpensesCount(expenses.length);
  }, [expenses]);

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExpenses = () => {
    // Form validation
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

    // Validate values
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

    // Add new expenses
    const newExpenses = expenseItems.map((item, index) => ({
      id: expenses.length + index + 1,
      description: item.description,
      category: item.category,
      value: parseFloat(item.value),
      date: item.date,
      status: "Pendente" // Default status
    }));

    setExpenses([...expenses, ...newExpenses]);
    setIsDialogOpen(false);
    setExpenseItems([
      { id: 1, description: "", category: "", value: "", date: "" }
    ]);

    toast({
      title: `${newExpenses.length > 1 ? 'Despesas registradas' : 'Despesa registrada'}`,
      description: `${newExpenses.length > 1 ? 'As despesas foram adicionadas' : 'A despesa foi adicionada'} com sucesso.`
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
    
    setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
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

  return (
    <div>
      <PageHeader 
        title="Registro de Despesas" 
        description="Cadastre e visualize suas despesas" 
      />

      {/* Summary Cards */}
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
              Valor total de todas as despesas
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

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por descrição ou categoria..." 
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsCategoryDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Despesa
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma despesa encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
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
      
      {/* Edit Expense Dialog */}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateExpense}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{expenseToDelete?.description}</p>
            <p className="text-muted-foreground">R$ {expenseToDelete?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDeleteExpense}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
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
              <Card key={item.id} className="p-4">
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
                </div>
              </Card>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddExpenseItem}
            >
              <AddIcon className="mr-2 h-4 w-4" /> Adicionar Outro Item
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
