
export type ProductDB = {
  id: number;
  name: string;
  type: string;
  price: number;
  description?: string;
};

export const mockProducts: ProductDB[] = [
  { id: 1, name: "Consultoria", type: "Serviço", price: 200, description: "Consultoria hora/hora" },
  { id: 2, name: "Desenvolvimento de Site", type: "Serviço", price: 5000, description: "Desenvolvimento de site responsivo" },
  { id: 3, name: "Mouse", type: "Produto", price: 80, description: "Mouse sem fio" },
  { id: 4, name: "Suporte Técnico", type: "Serviço", price: 150, description: "Suporte técnico hora/hora" },
  { id: 5, name: "Teclado", type: "Produto", price: 120, description: "Teclado mecânico" },
];
