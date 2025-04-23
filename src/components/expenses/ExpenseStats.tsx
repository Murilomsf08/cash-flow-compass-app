
import { Check, Clock, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { ExpenseDB } from "@/services/expensesService";

interface ExpenseStatsProps {
  expenses: ExpenseDB[];
  stats: {
    totalExpense: number;
    expensesByCategory: Record<string, number>;
    chartData: Array<{ month: string; value: number }>;
    currentMonth: string;
    totalForMonth: number;
    statusData: Record<string, number>;
  };
}

export function ExpenseStats({ expenses, stats }: ExpenseStatsProps) {
  const {
    totalExpense,
    expensesByCategory,
    chartData,
    currentMonth,
    totalForMonth,
    statusData
  } = stats;

  return (
    <>
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
                <span className="font-medium">{statusData["Pago"] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-500 mr-2" />
                  <span>Pendentes</span>
                </div>
                <span className="font-medium">{statusData["Pendente"] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <X className="h-4 w-4 text-red-500 mr-2" />
                  <span>Canceladas</span>
                </div>
                <span className="font-medium">{statusData["Cancelado"] || 0}</span>
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
            {expenses.filter(e => e.paymentType === "Parcelado").length > 0 ? (
              <div className="space-y-2">
                {expenses
                  .filter(e => e.paymentType === "Parcelado" && e.installment === 1)
                  .map(expense => (
                    <div key={expense.id} className="border rounded p-2">
                      <div className="font-medium">{expense.description.split(" (")[0]}</div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Total: R$ {(expense.value * (expense.totalInstallments || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span>{expense.totalInstallments}x de R$ {expense.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma despesa parcelada registrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
