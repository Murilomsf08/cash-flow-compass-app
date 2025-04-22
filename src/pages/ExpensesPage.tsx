
import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - replace with API calls in a real application
const MOCK_EXPENSES = [
  {
    id: 1,
    date: new Date("2024-01-15"),
    category: "Aluguel",
    description: "Aluguel do escritório",
    value: 1500,
  },
  {
    id: 2,
    date: new Date("2024-01-20"),
    category: "Marketing",
    description: "Campanha de Google Ads",
    value: 500,
  },
  {
    id: 3,
    date: new Date("2024-02-01"),
    category: "Salários",
    description: "Pagamento dos funcionários",
    value: 4000,
  },
  {
    id: 4,
    date: new Date("2024-02-10"),
    category: "Contas",
    description: "Conta de luz",
    value: 200,
  },
  {
    id: 5,
    date: new Date("2024-03-01"),
    category: "Salários",
    description: "Pagamento dos funcionários",
    value: 4000,
  },
  {
    id: 6,
    date: new Date("2024-03-15"),
    category: "Aluguel",
    description: "Aluguel do escritório",
    value: 1500,
  },
  {
    id: 7,
    date: new Date("2024-04-01"),
    category: "Salários",
    description: "Pagamento dos funcionários",
    value: 4000,
  },
  {
    id: 8,
    date: new Date("2024-04-10"),
    category: "Contas",
    description: "Conta de água",
    value: 150,
  },
  {
    id: 9,
    date: new Date("2024-05-01"),
    category: "Salários",
    description: "Pagamento dos funcionários",
    value: 4000,
  },
  {
    id: 10,
    date: new Date("2024-05-20"),
    category: "Marketing",
    description: "Campanha de Facebook Ads",
    value: 600,
  },
];

const MOCK_EXPENSE_CATEGORIES = [
  "Aluguel",
  "Salários",
  "Marketing",
  "Contas",
  "Outros",
];

// Expense type
type Expense = {
  id: number;
  date: Date;
  category: string;
  description: string;
  value: number;
};

export default function ExpensesPage() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [category, setCategory] = useState(MOCK_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    setExpenses(MOCK_EXPENSES);
  }, []);

  const handleAddExpense = () => {
    if (!selectedDate || !category || !description || !value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const newExpense = {
      id: expenses.length + 1,
      date: selectedDate,
      category: category,
      description: description,
      value: parseFloat(value),
    };

    setExpenses([...expenses, newExpense]);
    setOpen(false);

    toast({
      title: "Sucesso",
      description: "Despesa adicionada com sucesso.",
    });

    // Clear form
    setSelectedDate(new Date());
    setCategory(MOCK_EXPENSE_CATEGORIES[0]);
    setDescription("");
    setValue("");
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setSelectedDate(expense.date);
    setCategory(expense.category);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setEditOpen(true);
  };

  const handleUpdateExpense = () => {
    if (!selectedExpense) return;

    if (!selectedDate || !category || !description || !value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const updatedExpenses = expenses.map((expense) =>
      expense.id === selectedExpense.id
        ? {
            ...expense,
            date: selectedDate,
            category: category,
            description: description,
            value: parseFloat(value),
          }
        : expense
    );

    setExpenses(updatedExpenses);
    setEditOpen(false);

    toast({
      title: "Sucesso",
      description: "Despesa atualizada com sucesso.",
    });

    // Clear form
    setSelectedExpense(null);
    setSelectedDate(new Date());
    setCategory(MOCK_EXPENSE_CATEGORIES[0]);
    setDescription("");
    setValue("");
  };

  const handleDeleteExpense = (expense: Expense) => {
    const updatedExpenses = expenses.filter((e) => e.id !== expense.id);
    setExpenses(updatedExpenses);

    toast({
      title: "Sucesso",
      description: "Despesa excluída com sucesso.",
    });
  };

  // Chart data
  const monthlyExpenses = expenses.reduce((acc: any, expense: Expense) => {
    const month = format(expense.date, "MMMM", { locale: ptBR });
    if (acc[month]) {
      acc[month] += expense.value;
    } else {
      acc[month] = expense.value;
    }
    return acc;
  }, {});

  const chartData = Object.entries(monthlyExpenses).map(([month, value]) => ({
    month,
    value,
  }));

  // Calculate total expenses
  const totalExpense = expenses.reduce((acc, expense) => acc + expense.value, 0);

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc: any, expense: Expense) => {
    if (acc[expense.category]) {
      acc[expense.category] += expense.value;
    } else {
      acc[expense.category] = expense.value;
    }
    return acc;
  }, {});

  // Get current month
  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });

  // Calculate total expenses for the current month
  const totalForMonth = expenses.reduce((acc: number, expense: Expense) => {
    const month = format(expense.date, "MMMM", { locale: ptBR });
    if (month === currentMonth) {
      acc += expense.value;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
        <p className="text-muted-foreground">
          Acompanhe suas despesas e mantenha o controle financeiro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>
            Todas as despesas registradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(expense.date, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-right">
                    R$ {expense.value.toString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Mês</CardTitle>
            <CardDescription>
              Visão geral das despesas mensais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="text-right font-bold">
              Total: R$ {totalExpense.toString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas por categoria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul>
              {Object.entries(expensesByCategory).map(([category, value]) => (
                <li key={category} className="flex justify-between py-2">
                  <span>{category}</span>
                  <span>R$ {value.toString()}</span>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold">
              Total: R$ {totalExpense.toString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas do Mês</CardTitle>
          <CardDescription>
            Total de despesas no mês de {currentMonth}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            R$ {totalForMonth.toString()}
          </p>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Despesa
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma nova despesa ao sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Valor
              </Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExpense}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
            <DialogDescription>
              Edite as informações da despesa selecionada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2020-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Valor
              </Label>
              <Input
                id="value"
                type="number"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateExpense}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
