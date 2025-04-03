
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart, Legend } from "recharts";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

// Mock data (later would come from a real API/database)
const mockServices = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250 },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500 },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120 },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80 },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300 },
];

const mockExpenses = [
  { id: 1, description: "Aluguel Escritório", category: "Fixo", value: 1500, date: "2025-03-10" },
  { id: 2, description: "Internet", category: "Fixo", value: 200, date: "2025-03-12" },
  { id: 3, description: "Material de Escritório", category: "Variável", value: 350, date: "2025-03-18" },
  { id: 4, description: "Energia", category: "Fixo", value: 300, date: "2025-03-20" },
  { id: 5, description: "Jantar com Cliente", category: "Variável", value: 250, date: "2025-04-01" },
];

export default function Dashboard() {
  const { toast } = useToast();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [profit, setProfit] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [clientData, setClientData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    // Calculate metrics
    const income = mockServices.reduce((acc, service) => acc + service.value, 0);
    const expenses = mockExpenses.reduce((acc, expense) => acc + expense.value, 0);
    const commissions = mockServices.reduce((acc, service) => acc + service.commission, 0);
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setProfit(income - expenses);
    setTotalCommissions(commissions);

    // Prepare client data
    const clientMap = new Map();
    mockServices.forEach(service => {
      const current = clientMap.get(service.client) || 0;
      clientMap.set(service.client, current + service.value);
    });
    
    const clientChartData = Array.from(clientMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    setClientData(clientChartData);

    // Prepare service data
    const serviceMap = new Map();
    mockServices.forEach(service => {
      const current = serviceMap.get(service.name) || 0;
      serviceMap.set(service.name, current + service.value);
    });
    
    const serviceChartData = Array.from(serviceMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    setServiceData(serviceChartData);

    // Prepare monthly data
    const monthlyMap = new Map();
    
    // Add income per month
    mockServices.forEach(service => {
      const month = service.date.substring(0, 7);
      const current = monthlyMap.get(month) || { month, income: 0, expense: 0 };
      monthlyMap.set(month, { 
        ...current, 
        income: current.income + service.value 
      });
    });
    
    // Add expenses per month
    mockExpenses.forEach(expense => {
      const month = expense.date.substring(0, 7);
      const current = monthlyMap.get(month) || { month, income: 0, expense: 0 };
      monthlyMap.set(month, { 
        ...current, 
        expense: current.expense + expense.value 
      });
    });
    
    const monthlyChartData = Array.from(monthlyMap.values()).map(item => ({
      month: item.month.substring(5) + '/' + item.month.substring(0, 4),
      receita: item.income,
      despesa: item.expense,
      lucro: item.income - item.expense
    }));
    
    setMonthlyData(monthlyChartData.sort((a, b) => a.month.localeCompare(b.month)));

    // Show welcome toast
    toast({
      title: "Dashboard Atualizado",
      description: "Os dados foram carregados com sucesso.",
    });
  }, [toast]);

  // Generate colors for the pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Visualize os principais indicadores financeiros do seu negócio"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalIncome.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Valor total de serviços prestados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalExpenses.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Total de gastos no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {profit.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Receita menos despesas 
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCommissions.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Total pago em comissões
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#1EB4E4" />
                <Bar dataKey="despesa" name="Despesa" fill="#FF6B6B" />
                <Bar dataKey="lucro" name="Lucro" fill="#46D39A" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="row-span-2">
          <CardHeader>
            <CardTitle>Clientes por Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={clientData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Serviços por Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
                />
                <Bar dataKey="value" fill="#1EB4E4">
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
