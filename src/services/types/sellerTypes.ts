
export type SellerDB = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  commission: number;
};

export const mockSellers: SellerDB[] = [
  { id: 1, name: "João Silva", email: "joao@empresa.com", phone: "(11) 98765-4321", commission: 10 },
  { id: 2, name: "Maria Oliveira", email: "maria@empresa.com", phone: "(11) 91234-5678", commission: 12 },
  { id: 3, name: "Pedro Santos", email: "pedro@empresa.com", phone: "(11) 99876-5432", commission: 8 },
];
