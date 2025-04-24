
export type ServiceDB = {
  id: number;
  name: string;
  client: string;
  value: number;
  date: string;
  commission: number;
  status: string;
  seller?: string;
};

export const mockServices: ServiceDB[] = [
  { id: 1, name: "Consultoria", client: "Empresa A", value: 2500, date: "2025-03-15", commission: 250, status: "Pending", seller: "Carlos Silva" },
  { id: 2, name: "Desenvolvimento Web", client: "Empresa B", value: 5000, date: "2025-03-20", commission: 500, status: "Completed", seller: "Ana Martins" },
  { id: 3, name: "Design Gráfico", client: "Pessoa C", value: 1200, date: "2025-03-25", commission: 120, status: "Cancelled", seller: "João Santos" },
  { id: 4, name: "Suporte Técnico", client: "Empresa A", value: 800, date: "2025-04-01", commission: 80, status: "Pending", seller: "Maria Souza" },
  { id: 5, name: "Consultoria", client: "Pessoa D", value: 3000, date: "2025-04-02", commission: 300, status: "Completed", seller: "Carlos Silva" },
];
