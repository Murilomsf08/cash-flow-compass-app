
import { useState } from "react";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useExpenses } from "@/hooks/useExpenses";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { StatusDropdown } from "@/components/expenses/StatusDropdown";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseStats } from "@/components/expenses/ExpenseStats";
import { filterExpenses, calculateExpenseStats } from "@/utils/expenseUtils";

export default function ExpensesPage() {
  const { expenses, isLoading, error, addExpense, addMultipleExpenses, updateExpense, deleteExpense, toggleStatus } =
    useExpenses();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState<number | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

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

  const filteredExpenses = filterExpenses(
    expenses,
    dateRange,
    categoryFilter,
    descriptionFilter,
    statusFilter
  );

  const stats = calculateExpenseStats(filteredExpenses);

  const handleAddExpense = async (formData: any) => {
    try {
      if (formData.installments && formData.installments > 1) {
        const installmentValue = formData.value / formData.installments;
        const expensesArray = Array.from({ length: formData.installments }, (_, i) => {
          const installmentDate = new Date(formData.date);
          installmentDate.setMonth(installmentDate.getMonth() + i);

          return {
            ...formData,
            date: installmentDate.toISOString(),
            description: `${formData.description} (${i + 1}/${formData.installments})`,
            value: installmentValue,
            paymentType: "Parcelado",
            installment: i + 1,
            totalInstallments: formData.installments,
          };
        });

        await addMultipleExpenses(expensesArray);
        toast({
          title: "Sucesso",
          description: `${formData.installments} parcelas adicionadas com sucesso.`,
        });
      } else {
        await addExpense(formData);
        toast({
          title: "Sucesso",
          description: "Despesa adicionada com sucesso.",
        });
      }
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Falha ao salvar a despesa.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateExpense = async (formData: any) => {
    try {
      await updateExpense(formData);
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
  };

  const handleDeleteExpense = async (expense: any) => {
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
  };

  const handleToggleStatus = async (id: number, newStatus: string) => {
    try {
      await toggleStatus({ id, newStatus });
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="flex flex-row gap-4 w-full md:w-auto">
            <Card className="flex-1 min-w-[180px]">
              <CardContent className="pt-4 pb-4 flex flex-col items-center">
                <div className="text-muted-foreground text-xs">Total de Despesas</div>
                <div className="text-2xl font-bold text-[#005f60]">
                  R$ {stats.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 min-w-[180px]">
              <CardContent className="pt-4 pb-4 flex flex-col items-center">
                <div className="text-muted-foreground text-xs">Qtd. de Despesas</div>
                <div className="text-2xl font-bold text-[#faab36]">{filteredExpenses.length}</div>
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

        <ExpenseFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          descriptionFilter={descriptionFilter}
          onDescriptionFilterChange={setDescriptionFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
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
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(parseISO(expense.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <StatusDropdown
                        expense={expense}
                        onStatusChange={handleToggleStatus}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.paymentType === "Parcelado" && expense.installment && expense.totalInstallments ? (
                        <span>
                          {expense.installment}/{expense.totalInstallments} parcela{expense.totalInstallments > 1 ? "s" : ""}
                          {expense.status === "Pago"
                            ? " paga"
                            : expense.status === "Pendente"
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
                                setSelectedExpense(expense);
                                setEditOpen(true);
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

      <ExpenseStats expenses={filteredExpenses} stats={stats} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Despesa</DialogTitle>
            <DialogDescription>
              Adicione uma ou mais despesas ao sistema.
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm onSubmit={handleAddExpense} />
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
          <ExpenseForm
            onSubmit={handleUpdateExpense}
            initialData={selectedExpense}
            isEdit
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
