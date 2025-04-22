
import React, { useState } from "react";
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
import { format, parseISO } from "date-fns";
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
import { useExpenses } from "@/hooks/useExpenses";

const MOCK_EXPENSE_CATEGORIES = [
  "Aluguel",
  "Salários",
  "Marketing",
  "Contas",
  "Outros",
];

export default function ExpensesPage() {
  const { expenses, isLoading, error, addExpense, updateExpense, deleteExpense, toggleStatus } =
    useExpenses();
  const { toast } = useToast();

  // Modal control
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState<number | null>(null);

  // Form states (add/edit)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(MOCK_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Handle create
  async function handleAddExpense() {
    if (!selectedDate || !category || !description || !value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    try {
      await addExpense({
        date: selectedDate.toISOString(),
        category,
        description,
        value: parseFloat(value),
      });
      toast({
        title: "Sucesso",
        description: "Despesa adicionada com sucesso.",
      });
      setOpen(false);
      setSelectedDate(new Date());
      setCategory(MOCK_EXPENSE_CATEGORIES[0]);
      setDescription("");
      setValue("");
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao salvar a despesa.",
        variant: "destructive",
      });
    }
  }

  // Prepare editing
  function handleEditExpense(expense: any) {
    setSelectedExpense(expense);
    setSelectedDate(parseISO(expense.date));
    setCategory(expense.category);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setEditOpen(true);
  }

  // Handle update
  async function handleUpdateExpense() {
    if (!selectedExpense) return;
    if (!selectedDate || !category || !description || !value) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateExpense({
        id: selectedExpense.id,
        date: selectedDate.toISOString(),
        category,
        description,
        value: parseFloat(value),
      });
      toast({
        title: "Sucesso",
        description: "Despesa atualizada.",
      });
      setEditOpen(false);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao editar.",
        variant: "destructive",
      });
    }
  }

  // Excluir
  async function handleDeleteExpense(expense: any) {
    try {
      await deleteExpense(expense.id);
      toast({
        title: "Sucesso",
        description: "Despesa excluída.",
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao excluir.",
        variant: "destructive",
      });
    }
  }

  // Toggle status
  async function handleToggleStatus(expense: any) {
    try {
      await toggleStatus({ id: expense.id, currentStatus: expense.status });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível alterar status.",
        variant: "destructive",
      });
    }
  }

  // Processos para gráficos e totais
  const validExpenses = Array.isArray(expenses)
    ? expenses
    : [];
  const totalExpense = validExpenses.reduce((acc, e) => acc + (e.value || 0), 0);

  const expensesByCategory = validExpenses.reduce((acc: any, expense: any) => {
    if (acc[expense.category]) acc[expense.category] += expense.value;
    else acc[expense.category] = expense.value;
    return acc;
  }, {});

  const monthlyExpenses = validExpenses.reduce((acc: any, expense: any) => {
    const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
    if (acc[month]) acc[month] += expense.value;
    else acc[month] = expense.value;
    return acc;
  }, {});
  const chartData = Object.entries(monthlyExpenses).map(([month, value]) => ({
    month,
    value,
  }));

  const currentMonth = format(new Date(), "MMMM", { locale: ptBR });
  const totalForMonth = validExpenses.reduce((acc, expense) => {
    const month = format(parseISO(expense.date), "MMMM", { locale: ptBR });
    if (month === currentMonth) acc += expense.value;
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* TOPO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div className="flex flex-row gap-4 w-full md:w-auto">
          <Card className="flex-1 min-w-[180px]">
            <CardContent className="pt-4 pb-4 flex flex-col items-center">
              <div className="text-muted-foreground text-xs">Total de Despesas</div>
              <div className="text-2xl font-bold text-[#005f60]">R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[180px]">
            <CardContent className="pt-4 pb-4 flex flex-col items-center">
              <div className="text-muted-foreground text-xs">Qtd. de Despesas</div>
              <div className="text-2xl font-bold text-[#faab36]">{validExpenses.length}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end w-full md:w-auto">
          <Button
            className="bg-[#005f60] text-white hover:bg-[#008083]"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
          <CardDescription>
            Todas as despesas registradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className='p-4 text-center'>Carregando...</div>
          ) : error ? (
            <div className='p-4 text-red-500'>Erro ao carregar despesas!</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(parseISO(expense.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={expense.status === "Ativa" ? "secondary" : "outline"}
                        className={
                          expense.status === "Ativa"
                            ? "bg-[#057a55] text-white px-3"
                            : "border border-[#fc4141] text-[#fc4141] px-3"
                        }
                        onClick={() => handleToggleStatus(expense)}
                      >
                        {expense.status}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={expense.value < 0 ? "text-red-600" : ""}>
                        R$ {Number(expense.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="relative flex justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            setActionsOpen(actionsOpen === expense.id ? null : expense.id)
                          }
                        >
                          <span className="sr-only">Ações</span>
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="4" cy="10" r="2" />
                            <circle cx="10" cy="10" r="2" />
                            <circle cx="16" cy="10" r="2" />
                          </svg>
                        </Button>
                        {actionsOpen === expense.id && (
                          <div className="absolute z-10 right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg animate-in fade-in-0">
                            <button
                              className="block w-full px-4 py-2 text-sm text-left hover:bg-muted hover:text-primary"
                              onClick={() => {
                                setActionsOpen(null);
                                handleEditExpense(expense);
                              }}
                            >
                              <Edit className="inline w-4 h-4 mr-2" /> Editar
                            </button>
                            <button
                              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-muted"
                              onClick={() => {
                                setActionsOpen(null);
                                handleDeleteExpense(expense);
                              }}
                            >
                              <Trash2 className="inline w-4 h-4 mr-2" /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Gráficos e cards estatísticos */}
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
              Total: R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <span>R$ {Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold">
              Total: R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            R$ {totalForMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      {/* Modal adicionar */}
      <Dialog open={open} onOpenChange={setOpen}>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExpense}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal editar */}
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
