
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { format, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Edit, Trash2, Check, Clock, X, Filter } from "lucide-react";
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const MOCK_EXPENSE_CATEGORIES = [
  "Aluguel",
  "Salários",
  "Marketing",
  "Contas",
  "Impostos",
  "Equipamentos",
  "Manutenção",
  "Alimentação",
  "Transporte",
  "Outros",
];

const EXPENSE_STATUS = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  CANCELADO: "Cancelado",
};

export default function ExpensesPage() {
  const { expenses, isLoading, error, addExpense, addMultipleExpenses, updateExpense, deleteExpense, toggleStatus } =
    useExpenses();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState(MOCK_EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState(EXPENSE_STATUS.PENDENTE);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [isParceled, setIsParceled] = useState(false);
  const [installments, setInstallments] = useState<number>(1);

  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [descriptionFilter, setDescriptionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [multiExpenses, setMultiExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!expenses || !Array.isArray(expenses)) return;

    let filtered = [...expenses];

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      });
    }

    if (categoryFilter) {
      filtered = filtered.filter((expense) => expense.category === categoryFilter);
    }

    if (descriptionFilter) {
      filtered = filtered.filter((expense) => 
        expense.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((expense) => expense.status === statusFilter);
    }

    setFilteredExpenses(filtered);
  }, [expenses, dateRange, categoryFilter, descriptionFilter, statusFilter]);

  async function handleAddExpense() {
    if (multiExpenses.length > 0) {
      try {
        await addMultipleExpenses(multiExpenses);
        toast({
          title: "Sucesso",
          description: `${multiExpenses.length} despesas adicionadas!`,
        });
        setMultiExpenses([]);
        setOpen(false);
        resetFormFields();
        return;
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Falha ao salvar as despesas.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!selectedDate || !category || !description || !value || !status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const valueNum = parseFloat(value);

      if (isParceled && installments > 1) {
        const installmentValue = valueNum / installments;
        const expensesArray = [];

        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(selectedDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          expensesArray.push({
            date: installmentDate.toISOString(),
            category,
            description: `${description} (${i + 1}/${installments})`,
            value: installmentValue,
            status: i === 0 ? status : EXPENSE_STATUS.PENDENTE,
            paymentType: "Parcelado",
            installment: i + 1,
            totalInstallments: installments,
          });
        }

        await addMultipleExpenses(expensesArray);
        toast({
          title: "Sucesso",
          description: `${installments} parcelas adicionadas com sucesso.`,
        });
      } else {
        await addExpense({
          date: selectedDate.toISOString(),
          category,
          description,
          value: valueNum,
          status,
          paymentType: isParceled ? "Parcelado" : "À Vista",
        });
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso.",
        });
      }

      setOpen(false);
      resetFormFields();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao salvar a despesa.",
        variant: "destructive",
      });
    }
  }

  function handleAddMultiItem() {
    if (!selectedDate || !category || !description || !value || !status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    setMultiExpenses([
      ...multiExpenses,
      {
        date: selectedDate.toISOString(),
        category,
        description,
        value: parseFloat(value),
        status,
        paymentType: isParceled ? "Parcelado" : "À Vista",
        installment: isParceled ? 1 : undefined,
        totalInstallments: isParceled ? installments : undefined,
      },
    ]);
    resetFormFields();
  }

  function resetFormFields() {
    setSelectedDate(new Date());
    setCategory(MOCK_EXPENSE_CATEGORIES[0]);
    setDescription("");
    setValue("");
    setStatus(EXPENSE_STATUS.PENDENTE);
    setIsParceled(false);
    setInstallments(1);
  }

  function handleEditExpense(expense: any) {
    setSelectedExpense(expense);
    setSelectedDate(parseISO(expense.date));
    setCategory(expense.category);
    setDescription(expense.description);
    setValue(expense.value.toString());
    setStatus(expense.status);
    setEditOpen(true);
  }

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
        status,
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

  async function handleToggleStatus(expense: any, newStatus: string) {
    try {
      await toggleStatus({ id: expense.id, newStatus });
      toast({
        title: "Sucesso",
        description: `Status alterado para ${newStatus}.`,
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível alterar status.",
        variant: "destructive",
      });
    }
  }

  function renderStatusIcon(status: string) {
    switch (status) {
      case EXPENSE_STATUS.PAGO:
        return <Check className="h-4 w-4 text-green-500" />;
      case EXPENSE_STATUS.PENDENTE:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case EXPENSE_STATUS.CANCELADO:
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  }

  const validExpenses = Array.isArray(filteredExpenses) ? filteredExpenses : [];
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

  const statusData = validExpenses.reduce((acc: any, expense: any) => {
    if (!acc[expense.status]) acc[expense.status] = 0;
    acc[expense.status] += 1;
    return acc;
  }, {});

  function StatusDropdown({ expense }: { expense: any }) {
    const [open, setOpen] = useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className={
              expense.status === EXPENSE_STATUS.PAGO
                ? "border-green-600 text-green-600 px-2"
                : expense.status === EXPENSE_STATUS.PENDENTE
                ? "border-amber-500 text-amber-500 px-2"
                : "border-red-600 text-red-600 px-2"
            }
          >
            {expense.status}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="z-50 bg-white">
          <DropdownMenuItem onClick={() => handleToggleStatus(expense, EXPENSE_STATUS.PAGO)}>
            <Check className="w-4 h-4 mr-2 text-green-500" /> Pago
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(expense, EXPENSE_STATUS.PENDENTE)}>
            <Clock className="w-4 h-4 mr-2 text-amber-500" /> Pendente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(expense, EXPENSE_STATUS.CANCELADO)}>
            <X className="w-4 h-4 mr-2 text-red-500" /> Cancelado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const validExpenses = Array.isArray(filteredExpenses) ? filteredExpenses : [];
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

  const statusData = validExpenses.reduce((acc: any, expense: any) => {
    if (!acc[expense.status]) acc[expense.status] = 0;
    acc[expense.status] += 1;
    return acc;
  }, {});

  async function handleAddExpense() {
    if (multiExpenses.length > 0) {
      try {
        await addMultipleExpenses(multiExpenses);
        toast({
          title: "Sucesso",
          description: `${multiExpenses.length} despesas adicionadas!`,
        });
        setMultiExpenses([]);
        setOpen(false);
        resetFormFields();
        return;
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Falha ao salvar as despesas.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!selectedDate || !category || !description || !value || !status) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const valueNum = parseFloat(value);

      if (isParceled && installments > 1) {
        const installmentValue = valueNum / installments;
        const expensesArray = [];

        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(selectedDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          expensesArray.push({
            date: installmentDate.toISOString(),
            category,
            description: `${description} (${i + 1}/${installments})`,
            value: installmentValue,
            status: i === 0 ? status : EXPENSE_STATUS.PENDENTE,
            paymentType: "Parcelado",
            installment: i + 1,
            totalInstallments: installments,
          });
        }

        await addMultipleExpenses(expensesArray);
        toast({
          title: "Sucesso",
          description: `${installments} parcelas adicionadas com sucesso.`,
        });
      } else {
        await addExpense({
          date: selectedDate.toISOString(),
          category,
          description,
          value: valueNum,
          status,
          paymentType: isParceled ? "Parcelado" : "À Vista",
        });
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso.",
        });
      }

      setOpen(false);
      resetFormFields();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao salvar a despesa.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    if (!expenses || !Array.isArray(expenses)) return;

    let filtered = [...expenses];

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return isWithinInterval(expenseDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      });
    }

    if (categoryFilter) {
      filtered = filtered.filter((expense) => expense.category === categoryFilter);
    }

    if (descriptionFilter) {
      filtered = filtered.filter((expense) => 
        expense.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((expense) => expense.status === statusFilter);
    }

    setFilteredExpenses(filtered);
  }, [expenses, dateRange, categoryFilter, descriptionFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
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
            <CardTitle className="text-md flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Período</Label>
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  className="w-full mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryFilter">Categoria</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>Todas as categorias</SelectItem>
                    {MOCK_EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="descriptionFilter">Descrição</Label>
                <Input
                  id="descriptionFilter"
                  placeholder="Buscar descrição..."
                  className="mt-1"
                  value={descriptionFilter}
                  onChange={(e) => setDescriptionFilter(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>Todos os status</SelectItem>
                    <SelectItem value={EXPENSE_STATUS.PAGO}>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> Pago
                      </div>
                    </SelectItem>
                    <SelectItem value={EXPENSE_STATUS.PENDENTE}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-amber-500 mr-2" /> Pendente
                      </div>
                    </SelectItem>
                    <SelectItem value={EXPENSE_STATUS.CANCELADO}>
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-2" /> Cancelado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead>Pagamento</TableHead>
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
                      <StatusDropdown expense={expense} />
                    </TableCell>
                    <TableCell>
                      {expense.paymentType === "Parcelado" && expense.installment && expense.totalInstallments ? (
                        <span>
                          {expense.installment}/{expense.totalInstallments} parcela{expense.totalInstallments > 1 ? "s" : ""}
                          {expense.status === EXPENSE_STATUS.PAGO
                            ? " paga"
                            : expense.status === EXPENSE_STATUS.PENDENTE
                            ? ` (${expense.totalInstallments - expense.installment + 1} restantes)`
                            : ""}
                        </span>
                      ) : (
                        <span>
                          {expense.paymentType === "À Vista" ? "À Vista" : expense.paymentType}
                        </span>
                      )}
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
                <RechartsTooltip />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Status das Despesas</CardTitle>
            <CardDescription>
              Distribuição das despesas por status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span>Pagas</span>
                </div>
                <span className="font-medium">{statusData[EXPENSE_STATUS.PAGO] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-500 mr-2" />
                  <span>Pendentes</span>
                </div>
                <span className="font-medium">{statusData[EXPENSE_STATUS.PENDENTE] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span>Canceladas</span>
                </div>
                <span className="font-medium">{statusData[EXPENSE_STATUS.CANCELADO] || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos</CardTitle>
            <CardDescription>
              Despesas parceladas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {validExpenses.filter(e => e.paymentType === "Parcelado").length > 0 ? (
              <div className="space-y-2">
                {validExpenses
                  .filter(e => e.paymentType === "Parcelado" && e.installment === 1)
                  .map(expense => (
                    <div key={expense.id} className="border rounded p-2">
                      <div className="font-medium">{expense.description.split(" (")[0]}</div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total: R$ {(expense.value * expense.totalInstallments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span>{expense.totalInstallments}x de R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma despesa parcelada registrada.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma ou mais despesas ao sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] pl-3 text-left font-normal",
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
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
                step="0.01"
                min="0"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Forma de Pagamento</Label>
              <RadioGroup
                className="col-span-2 flex flex-row gap-4"
                value={isParceled ? "parcelado" : "avista"}
                onValueChange={(v) => setIsParceled(v === "parcelado")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="avista" id="avista" />
                  <Label htmlFor="avista">À Vista</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parcelado" id="parcelado" />
                  <Label htmlFor="parcelado">Parcelado</Label>
                </div>
              </RadioGroup>
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPENSE_STATUS.PAGO}>Pago</SelectItem>
                  <SelectItem value={EXPENSE_STATUS.PENDENTE}>Pendente</SelectItem>
                  <SelectItem value={EXPENSE_STATUS.CANCELADO}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isParceled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="installments" className="text-right">
                  Nº Parcelas
                </Label>
                <Input
                  id="installments"
                  type="number"
                  min="2"
                  max="36"
                  className="col-span-3"
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value) || 2)}
                />
              </div>
            )}
            {isParceled && installments > 1 && value && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  Valor por parcela:
                </div>
                <div className="col-span-3">
                  <strong>R$ {(parseFloat(value) / installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleAddMultiItem}
              >
                Adicionar mais um item
              </Button>
              <DialogFooter className="sm:justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddExpense}
                >
                  {multiExpenses.length > 0 ? 'Salvar todos' : 'Salvar'}
                </Button>
              </DialogFooter>
            </div>
            {multiExpenses.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Itens adicionados ({multiExpenses.length})</h4>
                <div className="max-h-40 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {multiExpenses.map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
            <DialogDescription>
              Altere as informações da despesa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Data
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] pl-3 text-left font-normal",
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
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
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
              <Label htmlFor="edit-description" className="text-right">
                Descrição
              </Label>
              <Input
                id="edit-description"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-value" className="text-right">
                Valor
              </Label>
              <Input
                id="edit-value"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EXPENSE_STATUS.PAGO}>Pago</SelectItem>
                  <SelectItem value={EXPENSE_STATUS.PENDENTE}>Pendente</SelectItem>
                  <SelectItem value={EXPENSE_STATUS.CANCELADO}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleUpdateExpense}
              >
                Salvar alterações
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
