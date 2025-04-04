
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Pie,
  PieChart,
  Legend,
  CartesianGrid,
  Line,
  LineChart,
  Label as RechartsLabel,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarRange,
  ShoppingCart,
  Percent,
  Filter,
} from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  addDays, 
  format, 
  isAfter, 
  isBefore, 
  isWithinInterval, 
  parseISO,
  differenceInDays,
  subDays,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Mock data (later would come from a real API/database)
const mockServices = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250, status: "Concluído", paymentType: "Cartão", quantity: 1, seller: "Carlos Silva", lastPurchase: "2025-03-15" },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500, status: "Concluído", paymentType: "Transferência", quantity: 1, seller: "Ana Martins", lastPurchase: "2025-03-20" },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120, status: "Concluído", paymentType: "Dinheiro", quantity: 1, seller: "João Santos", lastPurchase: "2025-01-10" },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80, status: "Pendente", paymentType: "Boleto", quantity: 1, seller: "Maria Souza", lastPurchase: "2025-01-05" },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300, status: "Pendente", paymentType: "Cartão", quantity: 1, seller: "Carlos Silva", lastPurchase: "2025-02-18" },
  { id: 6, name: "Desenvolvimento Web", client: "Empresa E", value: 4500, date: "2025-04-05", commission: 450, status: "Concluído", paymentType: "Transferência", quantity: 1, seller: "Ana Martins", lastPurchase: "2024-12-20" },
  { id: 7, name: "Design Gráfico", client: "Pessoa F", value: 950, date: "2025-04-10", commission: 95, status: "Concluído", paymentType: "Cartão", quantity: 1, seller: "João Santos", lastPurchase: "2024-12-15" },
];

const mockExpenses = [
  { id: 1, description: "Aluguel Escritório", category: "Fixo", value: 1500, date: "2025-03-10" },
  { id: 2, description: "Internet", category: "Fixo", value: 200, date: "2025-03-12" },
  { id: 3, description: "Material de Escritório", category: "Variável", value: 350, date: "2025-03-18" },
  { id: 4, description: "Energia", category: "Fixo", value: 300, date: "2025-03-20" },
  { id: 5, description: "Jantar com Cliente", category: "Variável", value: 250, date: "2025-04-01" },
  { id: 6, description: "Água", category: "Fixo", value: 120, date: "2025-04-03" },
  { id: 7, description: "Manutenção Equipamentos", category: "Variável", value: 480, date: "2025-04-08" },
];

// Combine services and expenses for the transactions table
const allTransactions = [
  ...mockServices.map(service => ({
    id: `s-${service.id}`,
    date: service.date,
    description: service.name,
    client: service.client,
    value: service.value,
    paymentType: service.paymentType,
    status: service.status,
    type: "Receita",
    seller: service.seller
  })),
  ...mockExpenses.map(expense => ({
    id: `e-${expense.id}`,
    date: expense.date,
    description: expense.description,
    client: "-",
    value: expense.value,
    paymentType: "-",
    status: "-",
    type: "Despesa",
    category: expense.category
  }))
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function Dashboard() {
  const { toast } = useToast();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [profit, setProfit] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [grossProfit, setGrossProfit] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [clientData, setClientData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [expenseCategoryData, setExpenseCategoryData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState(allTransactions);
  const [sellerData, setSellerData] = useState<any[]>([]);
  const [inactiveClientsData, setInactiveClientsData] = useState<any[]>([]);
  
  // Date range state
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Filter states
  const [showIncomes, setShowIncomes] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  // Filter data based on date range
  const filterDataByDateRange = (data: any[], dateField: string) => {
    if (!dateRange.from || !dateRange.to) return data;
    
    return data.filter(item => {
      const itemDate = parseISO(item[dateField]);
      return isWithinInterval(itemDate, {
        start: dateRange.from,
        end: dateRange.to
      });
    });
  };

  // Apply all filters
  const applyAllFilters = (data: any[]) => {
    let result = filterDataByDateRange(data, 'date');
    
    // Filter by transaction type (income/expense)
    result = result.filter(item => {
      if (item.type === "Receita" && !showIncomes) return false;
      if (item.type === "Despesa" && !showExpenses) return false;
      return true;
    });
    
    // Filter by status
    result = result.filter(item => {
      if (item.status === "Pendente" && !showPending) return false;
      if (item.status === "Concluído" && !showCompleted) return false;
      return true;
    });
    
    return result;
  };

  useEffect(() => {
    // Apply all filters to the data
    const filteredServices = applyAllFilters(mockServices.map(s => ({...s, type: "Receita"})));
    const filteredExpenses = applyAllFilters(mockExpenses.map(e => ({...e, type: "Despesa"})));
    const updatedTransactions = applyAllFilters(allTransactions);
    setFilteredTransactions(updatedTransactions);

    // Calculate metrics
    const income = filteredServices.reduce((acc, service) => acc + service.value, 0);
    const expenses = filteredExpenses.reduce((acc, expense) => acc + expense.value, 0);
    const commissions = filteredServices.reduce((acc, service) => acc + service.commission, 0);
    const gross = income - commissions;
    const net = gross - expenses;
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setProfit(income - expenses);
    setTotalCommissions(commissions);
    setGrossProfit(gross);
    setNetProfit(net);
    setTotalServices(filteredServices.length);

    // Prepare client data
    const clientMap = new Map();
    filteredServices.forEach(service => {
      const current = clientMap.get(service.client) || { value: 0, count: 0 };
      clientMap.set(service.client, { 
        value: current.value + service.value,
        count: current.count + 1
      });
    });
    
    const clientChartData = Array.from(clientMap.entries()).map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count
    }));
    setClientData(clientChartData);

    // Prepare service data
    const serviceMap = new Map();
    filteredServices.forEach(service => {
      const current = serviceMap.get(service.name) || { value: 0, profit: 0, count: 0 };
      serviceMap.set(service.name, { 
        value: current.value + service.value,
        profit: current.profit + (service.value - service.commission),
        count: current.count + 1
      });
    });
    
    const serviceChartData = Array.from(serviceMap.entries()).map(([name, data]) => ({
      name,
      faturamento: data.value,
      lucro: data.profit,
      count: data.count
    }));
    setServiceData(serviceChartData);

    // Prepare expense category data
    const categoryMap = new Map();
    filteredExpenses.forEach(expense => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.value);
    });
    
    const categoryChartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    setExpenseCategoryData(categoryChartData);

    // Prepare monthly data
    const monthlyMap = new Map();
    
    // Add income per month
    filteredServices.forEach(service => {
      const month = service.date.substring(0, 7);
      const current = monthlyMap.get(month) || { month, income: 0, expense: 0 };
      monthlyMap.set(month, { 
        ...current, 
        income: current.income + service.value 
      });
    });
    
    // Add expenses per month
    filteredExpenses.forEach(expense => {
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
    
    // Prepare seller data
    const sellerMap = new Map();
    filteredServices.forEach(service => {
      const current = sellerMap.get(service.seller) || { value: 0, profit: 0, count: 0 };
      sellerMap.set(service.seller, {
        value: current.value + service.value,
        profit: current.profit + (service.value - service.commission),
        count: current.count + 1
      });
    });
    
    const sellerChartData = Array.from(sellerMap.entries()).map(([name, data]) => ({
      name,
      faturamento: data.value,
      lucro: data.profit,
      count: data.count
    }));
    setSellerData(sellerChartData);
    
    // Prepare inactive clients data (haven't returned in 60+ days)
    const today = new Date();
    const inactiveClients: any[] = [];
    
    // Create a map to find the most recent purchase date per client
    const clientLastPurchaseMap = new Map();
    mockServices.forEach(service => {
      const currentLastPurchase = clientLastPurchaseMap.get(service.client);
      const serviceDate = parseISO(service.date);
      
      if (!currentLastPurchase || isAfter(serviceDate, parseISO(currentLastPurchase))) {
        clientLastPurchaseMap.set(service.client, service.date);
      }
    });
    
    // Check which clients haven't returned in 60+ days
    clientLastPurchaseMap.forEach((lastPurchaseDate, clientName) => {
      const lastPurchaseDateObj = parseISO(lastPurchaseDate);
      const daysSinceLastPurchase = differenceInDays(today, lastPurchaseDateObj);
      
      if (daysSinceLastPurchase >= 60) {
        // Get total spent by this client
        const clientServices = mockServices.filter(service => service.client === clientName);
        const totalSpent = clientServices.reduce((sum, service) => sum + service.value, 0);
        const purchaseCount = clientServices.length;
        
        inactiveClients.push({
          name: clientName,
          lastPurchase: lastPurchaseDate,
          daysSinceLastPurchase,
          totalSpent,
          purchaseCount
        });
      }
    });
    
    setInactiveClientsData(inactiveClients.sort((a, b) => b.daysSinceLastPurchase - a.daysSinceLastPurchase));

    // Show toast when date range changes
    toast({
      title: "Dashboard Atualizado",
      description: `Dados filtrados de ${format(dateRange.from, 'dd/MM/yyyy')} até ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : 'hoje'}.`,
    });
  }, [toast, dateRange, showIncomes, showExpenses, showPending, showCompleted]);

  // Generate colors for the pie charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader 
          title="Dashboard" 
          description="Visualize os principais indicadores financeiros do seu negócio"
        />
        <div className="flex items-center gap-2">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" /> Mais Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <h4 className="font-medium leading-none">Filtros Adicionais</h4>
                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Tipo de Transação</h5>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-incomes" 
                      checked={showIncomes} 
                      onCheckedChange={(checked) => setShowIncomes(checked === true)}
                    />
                    <Label htmlFor="show-incomes">Mostrar Receitas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-expenses" 
                      checked={showExpenses}
                      onCheckedChange={(checked) => setShowExpenses(checked === true)}
                    />
                    <Label htmlFor="show-expenses">Mostrar Despesas</Label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <h5 className="text-sm font-medium">Status</h5>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-pending" 
                      checked={showPending}
                      onCheckedChange={(checked) => setShowPending(checked === true)}
                    />
                    <Label htmlFor="show-pending">Pendentes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="show-completed" 
                      checked={showCompleted}
                      onCheckedChange={(checked) => setShowCompleted(checked === true)}
                    />
                    <Label htmlFor="show-completed">Concluídos</Label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mt-6">
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
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <Percent className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCommissions.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Total pago em comissões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {grossProfit.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Receita - Comissões
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
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {netProfit.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">
              Lucro Bruto - Despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Serviços</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              Serviços realizados no período
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month">
                  <RechartsLabel value="Mês" offset={0} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <RechartsLabel value="Valor (R$)" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#1EB4E4" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}} />
                <Bar dataKey="despesa" name="Despesa" fill="#FF6B6B" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}} />
                <Bar dataKey="lucro" name="Lucro" fill="#46D39A" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="row-span-2">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseCategoryData.map((entry, index) => (
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
            <CardTitle>Faturamento e Lucro por Serviço</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <RechartsLabel value="Serviço" offset={0} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <RechartsLabel value="Valor (R$)" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "count") return [value, "Quantidade"];
                    return [`R$ ${Number(value).toLocaleString('pt-BR')}`, name === "faturamento" ? "Faturamento" : "Lucro"];
                  }}
                />
                <Legend />
                <Bar dataKey="faturamento" name="Faturamento" fill="#1EB4E4" label={{position: 'top', formatter: (value) => `R$${value}`}} />
                <Bar dataKey="lucro" name="Lucro" fill="#46D39A" label={{position: 'top', formatter: (value) => `R$${value}`}} />
                <Bar dataKey="count" name="Quantidade" fill="#FFBB28" label={{position: 'top'}} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Clientes por Faturamento</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <RechartsLabel value="Cliente" offset={0} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <RechartsLabel value="Valor (R$)" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "count") return [value, "Quantidade"];
                    return [`R$ ${Number(value).toLocaleString('pt-BR')}`, "Valor"];
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Faturamento" fill="#8884D8" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}}>
                  {clientData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="count" name="Quantidade" fill="#82ca9d" label={{position: 'top'}} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Desempenho por Vendedor</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sellerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name">
                  <RechartsLabel value="Vendedor" offset={0} position="insideBottom" />
                </XAxis>
                <YAxis yAxisId="left" orientation="left">
                  <RechartsLabel value="Valor (R$)" angle={-90} position="insideLeft" />
                </YAxis>
                <YAxis yAxisId="right" orientation="right">
                  <RechartsLabel value="Quantidade" angle={90} position="insideRight" />
                </YAxis>
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === "count") return [value, "Quantidade de Serviços"];
                    return [`R$ ${Number(value).toLocaleString('pt-BR')}`, name === "faturamento" ? "Faturamento" : "Lucro"];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="faturamento" name="Faturamento" fill="#1EB4E4" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}} />
                <Bar yAxisId="left" dataKey="lucro" name="Lucro" fill="#46D39A" label={{position: 'top', formatter: (value) => `R$${value.toLocaleString('pt-BR')}`}} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Serviços Realizados" stroke="#FF8042" strokeWidth={3} dot={{ r: 6 }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 row-span-1">
          <CardHeader>
            <CardTitle>Clientes Inativos (+ 60 dias)</CardTitle>
          </CardHeader>
          <CardContent className="h-80 overflow-auto">
            {inactiveClientsData.length > 0 ? (
              <div className="space-y-4">
                {inactiveClientsData.map((client, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{client.name}</h3>
                      <Badge variant="outline" className="text-amber-500">{client.daysSinceLastPurchase} dias</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div className="flex justify-between">
                        <span>Última compra:</span>
                        <span>{format(parseISO(client.lastPurchase), "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total gasto:</span>
                        <span>R$ {client.totalSpent.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compras realizadas:</span>
                        <span>{client.purchaseCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Não há clientes inativos por mais de 60 dias.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Todas as Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Lista de todas as transações no período selecionado.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(parseISO(transaction.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.client}</TableCell>
                    <TableCell>R$ {transaction.value.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{transaction.paymentType}</TableCell>
                    <TableCell>
                      {transaction.status !== "-" ? (
                        <Badge variant={transaction.status === "Concluído" ? "default" : "outline"}>
                          {transaction.status}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === "Receita" ? "secondary" : "destructive"}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
