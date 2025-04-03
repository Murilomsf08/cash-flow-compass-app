
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Mock data (later would come from a real API/database)
const initialExpenses = [
  { id: 1, description: "Aluguel Escritório", category: "Fixo", value: 1500, date: "2025-03-10" },
  { id: 2, description: "Internet", category: "Fixo", value: 200, date: "2025-03-12" },
  { id: 3, description: "Material de Escritório", category: "Variável", value: 350, date: "2025-03-18" },
  { id: 4, description: "Energia", category: "Fixo", value: 300, date: "2025-03-20" },
  { id: 5, description: "Jantar com Cliente", category: "Variável", value: 250, date: "2025-04-01" },
];

const categories = ["Fixo", "Variável", "Investimento", "Pessoal", "Impostos"];

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "",
    value: "",
    date: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  };

  const handleCategoryChange = (value: string) => {
    setNewExpense({
      ...newExpense,
      category: value
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExpense = () => {
    // Form validation
    if (!newExpense.description || !newExpense.category || !newExpense.value || !newExpense.date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const value = parseFloat(newExpense.value);

    if (isNaN(value) || value <= 0) {
      toast({
        title: "Valor inválido",
        description: "O valor da despesa deve ser um número positivo.",
        variant: "destructive"
      });
      return;
    }

    // Add new expense
    const newExpenseData = {
      id: expenses.length + 1,
      description: newExpense.description,
      category: newExpense.category,
      value: value,
      date: newExpense.date
    };

    setExpenses([...expenses, newExpenseData]);
    setIsDialogOpen(false);
    setNewExpense({
      description: "",
      category: "",
      value: "",
      date: ""
    });

    toast({
      title: "Despesa registrada",
      description: "A despesa foi adicionada com sucesso."
    });
  };

  return (
    <div>
      <PageHeader 
        title="Registro de Despesas" 
        description="Cadastre e visualize suas despesas" 
      />

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
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma despesa encontrada.
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
            <DialogTitle>Adicionar Nova Despesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input 
                id="description" 
                name="description" 
                value={newExpense.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={newExpense.category}
                onValueChange={handleCategoryChange}
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
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input 
                id="value" 
                name="value" 
                type="number"
                value={newExpense.value}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data *</Label>
              <Input 
                id="date" 
                name="date" 
                type="date"
                value={newExpense.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddExpense}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
